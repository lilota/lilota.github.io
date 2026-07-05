import React, { useState, useRef, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

const PROMPT_LINE_RE = /^\S+:\S*#\s*$/;
const PROMPT_ECHO_RE = /^\S+:\S*#\s+\S.*$/;
// NEW: Reliably detects a prompt attached to the very end of the output buffer, 
// ensuring it's bounded by a space or newline so we don't accidentally match filenames.
const PROMPT_END_RE = /(?:^|[\r\n\s])\S+:\S*#\s*$/;

// Enhanced utility to completely strip ANSI colors, bracketed paste modes, and null bytes
const stripAnsi = (str) => {
  let s = str.replace(/\x00/g, ''); // Strip null bytes common in serial streams
  s = s.replace(/\x1B\[[0-9;?]*[a-zA-Z]/g, ''); // The '?' is critical to catch modern shell codes
  s = s.replace(/\x1B\][^\x07]*\x07/g, ''); // Strip OSC sequences (like window titles)
  return s;
};

function normalizePath(p) {
  return p.replace(/\/{2,}/g, '/');
}

function buildFileTree(paths) {
  const root = { folders: {}, files: [] };
  for (const path of paths) {
    const parts = path.split('/').filter(Boolean);
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!node.folders[part]) node.folders[part] = { folders: {}, files: [] };
      node = node.folders[part];
    }
    node.files.push({ name: parts[parts.length - 1], fullPath: path });
  }
  return root;
}

function FileTreeNode({ node, path, depth, expanded, toggleExpand, activeFile, onOpenFile }) {
  const folderNames = Object.keys(node.folders).sort((a, b) => a.localeCompare(b));
  const fileEntries = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      {folderNames.map((name) => {
        const folderPath = path ? `${path}/${name}` : name;
        const isOpen = !!expanded[folderPath];
        return (
          <React.Fragment key={folderPath}>
            <button
              onClick={() => toggleExpand(folderPath)}
              className="w-full text-left text-[12px] px-1 py-1 rounded hover:bg-[#333] flex items-center gap-1 truncate"
              style={{ paddingLeft: `${depth * 12 + 4}px` }}
              title={folderPath}
            >
              <span className="w-3 inline-block text-gray-500">{isOpen ? '▾' : '▸'}</span>
              <span className="text-yellow-500">📁</span>
              <span className="truncate">{name}</span>
            </button>
            {isOpen && (
              <FileTreeNode
                node={node.folders[name]}
                path={folderPath}
                depth={depth + 1}
                expanded={expanded}
                toggleExpand={toggleExpand}
                activeFile={activeFile}
                onOpenFile={onOpenFile}
              />
            )}
          </React.Fragment>
        );
      })}
      {fileEntries.map((f) => (
        <button
          key={f.fullPath}
          onClick={() => onOpenFile(f.fullPath)}
          className={`w-full text-left text-[12px] px-1 py-1 rounded hover:bg-[#333] flex items-center gap-1 truncate ${
            activeFile === f.fullPath ? 'bg-[#0e639c] text-white' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 20}px` }}
          title={f.fullPath}
        >
          <span className="text-gray-400">📄</span>
          <span className="truncate">{f.name}</span>
        </button>
      ))}
    </>
  );
}

export default function Ide() {
  const [code, setCode] = useState('# Write your LIL script here\nputs "Hello Lilota!"');
  const [status, setStatus] = useState('Disconnected');
  const [connected, setConnected] = useState(false);
  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expanded, setExpanded] = useState({});

  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const portRef = useRef(null);
  const writerRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);

  const captureModeRef = useRef(null);
  const captureBufferRef = useRef('');
  const captureFilenameRef = useRef(null);
  const captureCommandRef = useRef(null);
  const captureMarkerRef = useRef(null);
  const captureCutoffRef = useRef(0);
  const captureTimeoutRef = useRef(null);
  const captureQuietTimeoutRef = useRef(null);
  const captureResolveRef = useRef(null);

  const opLockRef = useRef(Promise.resolve());
  const withLock = (fn) => {
    const run = opLockRef.current.then(fn, fn);
    opLockRef.current = run.catch(() => {});
    return run;
  };

  const markerCounterRef = useRef(0);
  const makeMarker = () => `__CMD_${Date.now()}_${(markerCounterRef.current++).toString(36)}__`;

  const CAPTURE_TIMEOUT_MS = 8000; // absolute backstop if the device never responds at all
  const QUIET_MS = 350; // how long the device must go silent before we treat a listing/read as finished

  const clearCaptureTimeout = () => {
    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
      captureTimeoutRef.current = null;
    }
  };

  const clearQuietTimeout = () => {
    if (captureQuietTimeoutRef.current) {
      clearTimeout(captureQuietTimeoutRef.current);
      captureQuietTimeoutRef.current = null;
    }
  };

  const resetCaptureState = () => {
    clearCaptureTimeout();
    clearQuietTimeout();
    captureModeRef.current = null;
    captureBufferRef.current = '';
    captureFilenameRef.current = null;
    captureCommandRef.current = null;
    captureMarkerRef.current = null;
    captureCutoffRef.current = 0;
  };

  const resolveCapture = () => {
    const resolve = captureResolveRef.current;
    captureResolveRef.current = null;
    if (resolve) resolve();
  };

  const timeoutCapture = () => {
    const mode = captureModeRef.current;
    const leftover = captureBufferRef.current;
    resetCaptureState();
    if (leftover) xtermInstance.current.write(leftover);
    xtermInstance.current.write(`\r\n--- ${mode || 'command'} timed out waiting for device ---\r\n`);
    setLoadingFiles(false);
    setLoadingFile(false);
    setIsSaving(false);
    resolveCapture();
  };

  const armPlainCapture = () => {
    clearCaptureTimeout();
    clearQuietTimeout();
    captureTimeoutRef.current = setTimeout(timeoutCapture, CAPTURE_TIMEOUT_MS);
    return new Promise((resolve) => { captureResolveRef.current = resolve; });
  };

  const armCaptureAndWait = (marker) => {
    captureCutoffRef.current = captureBufferRef.current.length;
    captureMarkerRef.current = marker;
    clearCaptureTimeout();
    clearQuietTimeout();
    captureTimeoutRef.current = setTimeout(timeoutCapture, CAPTURE_TIMEOUT_MS);
    return new Promise((resolve) => { captureResolveRef.current = resolve; });
  };

  useEffect(() => {
    const term = new Terminal({
      theme: {
        background: '#000000',
        foreground: '#cccccc',
        cursor: '#ffffff',
        selectionBackground: '#0e639c'
      },
      fontFamily: '"Fira Code", monospace',
      fontSize: 13,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;

    term.onData((data) => {
      if (writerRef.current) {
        const encoder = new TextEncoder();
        writerRef.current.write(encoder.encode(data));
      }
    });

    return () => term.dispose();
  }, []);

  const isEchoedCommandLine = (line) => {
    const trimmed = stripAnsi(line.trim());
    if (!trimmed) return false;
    if (!captureCommandRef.current) return false;
    if (trimmed === captureCommandRef.current) return true;
    if (PROMPT_ECHO_RE.test(trimmed) && trimmed.endsWith(captureCommandRef.current)) return true;
    return false;
  };

  const getLanguage = (filename) => {
    if (!filename) return 'tcl'; // Default to Tcl if no file is open
    
    const ext = filename.split('.').pop().toLowerCase();
    
    const map = {
      'tcl': 'tcl',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'json': 'json',
      'css': 'css',
      'html': 'html',
      'md': 'markdown',
      'txt': 'plaintext',
      'xml': 'xml',
      'sql': 'sql',
      'yaml': 'yaml',
      'yml': 'yaml',
    };

    return map[ext] || 'plaintext';
  };

  const parseFileListing = (raw) => {
    let cleanRaw = stripAnsi(raw);
    
    // 1. Remove the echoed command 'listfiles' if it exists at the start
    cleanRaw = cleanRaw.replace(/^listfiles\r?\n?/, '').trim();
    
    // 2. Remove the trailing prompt if present
    cleanRaw = cleanRaw.replace(PROMPT_END_RE, '').trim();

    // 3. Split by whitespace, filter, and normalize
    return cleanRaw
      .split(/\s+/)
      .map(f => f.trim())
      .filter(f => f.length > 0)
      .filter(f => f !== 'listfiles') // Failsafe against echoed commands
      .filter(f => !f.endsWith('#'))  // Failsafe against stray prompt fragments
      .map(f => normalizePath(f));
  };

  const parseFileContent = (raw) => {
    let cleanRaw = stripAnsi(raw);
    
    // Strip trailing prompt from the file output (cosmetic cleanup only)
    cleanRaw = cleanRaw.replace(PROMPT_END_RE, '');

    const lines = cleanRaw.split(/\r?\n/);
    const contentLines = lines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (PROMPT_LINE_RE.test(trimmed)) return false;
      if (isEchoedCommandLine(line)) return false;
      return true;
    });
    while (contentLines.length && contentLines[0].trim() === '') contentLines.shift();
    while (contentLines.length && contentLines[contentLines.length - 1].trim() === '') contentLines.pop();
    return contentLines.join('\n');
  };

  const finishQuietCapture = (mode) => {
    captureQuietTimeoutRef.current = null;
    if (captureModeRef.current !== mode) return; // stale timer from a prior op

    const filename = captureFilenameRef.current;
    const rawContent = captureBufferRef.current;
    resetCaptureState();

    if (mode === 'listfiles') {
      setFiles(parseFileListing(rawContent));
      setLoadingFiles(false);
    } else if (mode === 'cat') {
      setCode(parseFileContent(rawContent));
      setActiveFile(filename);
      setLoadingFile(false);
    }

    resolveCapture();
  };

  const handleIncoming = (text) => {
    if (captureModeRef.current) {
      // FIX: Echo output to the terminal during 'cat' and 'listfiles'.
      // Swallowing this output is what swallowed the trailing prompt and 
      // made the terminal look "eaten" or frozen when the operation finished.
      if (captureModeRef.current !== 'save') {
        xtermInstance.current.write(text);
      }

      captureBufferRef.current += text;
      const mode = captureModeRef.current;
      const cleanBuffer = stripAnsi(captureBufferRef.current);

      if (mode === 'save') {
        clearCaptureTimeout();
        captureTimeoutRef.current = setTimeout(timeoutCapture, CAPTURE_TIMEOUT_MS);

        const marker = captureMarkerRef.current;
        if (!marker) return;

        const lastIdx = cleanBuffer.lastIndexOf(marker);
        if (lastIdx === -1) return;

        const tail = cleanBuffer.slice(lastIdx);
        let isDone = PROMPT_END_RE.test(tail);

        if (!isDone) {
          const firstIdx = cleanBuffer.indexOf(marker);
          if (firstIdx !== -1 && firstIdx !== lastIdx) {
            const tailAfterMarker = cleanBuffer.slice(lastIdx + marker.length);
            if (tailAfterMarker.includes('\n') || tailAfterMarker.includes('\r')) {
              isDone = true;
            }
          }
        }

        if (!isDone) return;

        resetCaptureState();
        setIsSaving(false);
        xtermInstance.current.write(`\r\n--- Save Complete ---\r\n`);
        resolveCapture();
        refreshFiles(); // This immediately triggers listfiles, which echoes and restores the prompt.
        return;
      }

      // --- LISTFILES / CAT ---
      clearCaptureTimeout();
      captureTimeoutRef.current = setTimeout(timeoutCapture, CAPTURE_TIMEOUT_MS);

      if (PROMPT_END_RE.test(cleanBuffer)) {
        finishQuietCapture(mode);
        return;
      }

      clearQuietTimeout();
      captureQuietTimeoutRef.current = setTimeout(() => finishQuietCapture(mode), QUIET_MS);
      return;
    }

    // Standard terminal pass-through when idle
    xtermInstance.current.write(text);
  };

  const slowWrite = async (text) => {
    if (!writerRef.current) return;
    const encoder = new TextEncoder();
    for (let i = 0; i < text.length; i++) {
      await writerRef.current.write(encoder.encode(text[i]));
      await new Promise((resolve) => setTimeout(resolve, 2));
    }
  };

  const toggleConnection = async () => {
    if (portRef.current) {
      keepReadingRef.current = false;
      if (readerRef.current) await readerRef.current.cancel();
      if (writerRef.current) writerRef.current.releaseLock();
      await portRef.current.close();
      portRef.current = null;
      setStatus('Disconnected');
      setConnected(false);
      setFiles([]);
      setActiveFile(null);
      setExpanded({});
      resetCaptureState();
      resolveCapture();
      setLoadingFiles(false);
      setLoadingFile(false);
      setIsSaving(false);
      xtermInstance.current.write('--- Disconnected ---\r\n');
    } else {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      writerRef.current = port.writable.getWriter();
      setStatus('Connected');
      setConnected(true);
      xtermInstance.current.write('--- Connected ---\r\n');
      keepReadingRef.current = true;

      const decoder = new TextDecoder();
      const readLoop = (async () => {
        while (port.readable && keepReadingRef.current) {
          readerRef.current = port.readable.getReader();
          try {
            while (true) {
              const { value, done } = await readerRef.current.read();
              if (done) break;
              handleIncoming(decoder.decode(value));
            }
          } finally {
            readerRef.current.releaseLock();
          }
        }
      })();

      // Pulse a hard reset on every connect so we always start from a known,
      // clean boot rather than whatever the device happened to be doing
      // before we attached.
      await hardReset();

      // Nudge with a bare \r once the device has had time to reboot and
      // print its boot banner — this console appears to need some input to
      // arrive before it draws its first prompt.
      /*setTimeout(() => {
        if (writerRef.current) slowWrite('\r');
      }, 1500);*/

      await readLoop;
    }
  };

  const hardReset = async () => {
    if (!portRef.current) return;
    try {
      // Standard ESP hardware reset sequence via WebSerial DTR/RTS
      await portRef.current.setSignals({ dataTerminalReady: false, requestToSend: true });
      await new Promise(r => setTimeout(r, 100));
      await portRef.current.setSignals({ dataTerminalReady: false, requestToSend: false });
      
      xtermInstance.current.write('\r\n--- Hard Reset Sent ---\r\n');
      
      // Clear IDE state to prepare for fresh boot
      setFiles([]);
      setActiveFile(null);
      resetCaptureState();
      setLoadingFiles(false);
      setLoadingFile(false);
      setIsSaving(false);
    } catch (err) {
      console.error("Reset failed:", err);
      xtermInstance.current.write('\r\n--- Reset Failed (Browser/Device may not support signals) ---\r\n');
    }
  };

  const refreshFiles = () => withLock(async () => {
    if (!writerRef.current) return;
    captureModeRef.current = 'listfiles';
    captureBufferRef.current = '';
    captureFilenameRef.current = null;
    captureCommandRef.current = 'listfiles'; // Used to strip the echo
    setLoadingFiles(true);

    const done = armPlainCapture();
    await slowWrite(`listfiles\r`); // Just send the native command — completion is detected via silence

    await done;
  });

  const openFile = (filename) => withLock(async () => {
    if (!writerRef.current) return;
    captureModeRef.current = 'cat';
    captureBufferRef.current = '';
    captureFilenameRef.current = filename;
    captureCommandRef.current = `cat ${filename}`;
    setLoadingFile(true);

    const done = armPlainCapture();
    await slowWrite(`cat ${filename}\r`);

    await done;
  });

  const createNewFile = () => {
    const filename = prompt("Enter a name for the new file (e.g., /app.tcl):");
    if (filename) {
      setActiveFile(filename);
      setCode(`# New file: ${filename}\n`);
    }
  };

  const saveFile = () => withLock(async () => {
    if (!writerRef.current) return;
    if (!activeFile) {
      alert("Please create a new file or select an existing one first.");
      return;
    }

    setIsSaving(true);
    captureModeRef.current = 'save';
    captureBufferRef.current = '';
    captureFilenameRef.current = null;

    await slowWrite('set _buf ""\r');
    await new Promise(r => setTimeout(r, 100));

    const lines = code.split('\n');
    for (let line of lines) {
      const safeLine = line
        .replace(/\\/g, '\\\\')
        .replace(/\$/g, '\\$')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/"/g, '\\"');

      await slowWrite(`append _buf "${safeLine}\\n"\r`);
      await new Promise(r => setTimeout(r, 50));
    }

    await slowWrite(`write ${activeFile} $_buf\r`);
    await new Promise(r => setTimeout(r, 150));

    await slowWrite('set _buf ""\r');
    await new Promise(r => setTimeout(r, 50));

    const marker = makeMarker();
    const done = armCaptureAndWait(marker);
    await slowWrite(`puts "${marker}"\r`);
    await done;
  });

  const executeCode = () => withLock(async () => {
    if (!writerRef.current) return;
    for (let line of code.split('\n')) {
      await slowWrite(line.replace('\r', '') + '\r');
      await new Promise((r) => setTimeout(r, 50));
    }
  });

  const toggleExpand = (folderPath) => {
    setExpanded((prev) => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  const tree = useMemo(() => buildFileTree(files), [files]);

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#1e1e1e] text-white">
      <div className="w-[220px] bg-[#252526] p-4 border-r border-[#333] flex flex-col gap-2">
        <div className="flex gap-2">
          <button onClick={toggleConnection} className={`flex-1 p-2 rounded font-bold text-sm ${connected ? 'bg-red-700' : 'bg-blue-700'}`}>
            {connected ? 'Disconnect' : 'Connect'}
          </button>
          <button 
            onClick={hardReset} 
            disabled={!connected} 
            className="w-10 p-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm font-bold flex items-center justify-center" 
            title="Hard Reset Board"
          >
            ↻
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={refreshFiles} disabled={!connected} className="flex-1 p-2 bg-[#333] hover:bg-[#444] disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm">
            Refresh
          </button>
          <button onClick={createNewFile} disabled={!connected} className="flex-1 p-2 bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm">
            + New
          </button>
        </div>

        <div className="mt-2 flex-1 min-h-0 flex flex-col border-t border-[#333] pt-2">
          <div className="text-[10px] uppercase text-gray-500 mb-1 flex items-center justify-between">
            <span>Files</span>
            {(loadingFiles || loadingFile || isSaving) && <span className="text-gray-400">…</span>}
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
            {files.length === 0 && !loadingFiles && (
              <div className="text-[11px] text-gray-600 italic px-1">
                {connected ? 'No files loaded' : 'Connect to browse'}
              </div>
            )}
            <FileTreeNode
              node={tree}
              path=""
              depth={0}
              expanded={expanded}
              toggleExpand={toggleExpand}
              activeFile={activeFile}
              onOpenFile={openFile}
            />
          </div>
        </div>

        <div className="text-[10px] text-gray-500 uppercase">{status}</div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-2 border-b border-[#333] flex items-center justify-between">
          <div className="text-xs text-gray-400 truncate">{activeFile || 'untitled.tcl'}</div>
          <div className="flex gap-2">
            <button
              onClick={executeCode}
              disabled={!connected}
              className="px-4 py-1 bg-[#333] hover:bg-[#444] disabled:opacity-40 rounded text-sm font-medium"
            >
              Run
            </button>
            <button
              onClick={saveFile}
              disabled={!connected || isSaving}
              className="px-4 py-1 bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-40 rounded text-sm font-medium"
            >
              {isSaving ? 'Saving...' : 'Save File'}
            </button>
          </div>
        </div>
        <div className="flex-[3] min-h-0">
          <Editor
            theme="vs-dark"
            language={getLanguage(activeFile)}
            value={code}
            onChange={setCode}
            options={{ minimap: { enabled: false } }}
          />
        </div>
        <div className="flex-1 bg-black p-2 border-t border-[#333] relative min-h-0">
          <div ref={terminalRef} className="h-full" />
        </div>
      </div>
    </div>
  );
}