import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function Ide() {
  const [code, setCode] = useState('# Write your LIL script here\nputs "Hello Lilota!"\n');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('Disconnected');
  
  // Connection Mode State
  const [connMode, setConnMode] = useState('serial'); // 'serial' or 'wifi'
  const [deviceIp, setDeviceIp] = useState('http://192.168.4.1');
  
  // Serial API Refs
  const portRef = useRef(null);
  const writerRef = useRef(null);
  const readerRef = useRef(null);
  const serialBuffer = useRef('');

  // ----------------------------------------------------------------
  // SERIAL CONNECTION LOGIC
  // ----------------------------------------------------------------
  
  const connectSerial = async () => {
    if (!('serial' in navigator)) {
      alert("Web Serial is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      // 1. Request port access from user
      const port = await navigator.serial.requestPort();
      // ESP32 and Pico typically use 115200 baud
      await port.open({ baudRate: 115200 }); 
      portRef.current = port;
      setStatus('Serial Connected');

      // 2. Setup Writer (to send TCL commands)
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      writerRef.current = textEncoder.writable.getWriter();

      // 3. Setup Reader (to listen to MCU output)
      startSerialReadLoop(port);
      
      // Auto-fetch files upon connection
      setTimeout(fetchFilesSerial, 500);

    } catch (err) {
      console.error("Serial connection failed:", err);
      setStatus('Serial Error');
    }
  };

  const startSerialReadLoop = async (activePort) => {
    const textDecoder = new TextDecoderStream();
    activePort.readable.pipeTo(textDecoder.writable);
    readerRef.current = textDecoder.readable.getReader();

    try {
      while (true) {
        const { value, done } = await readerRef.current.read();
        if (done) break;
        if (value) {
          // Append incoming text to our invisible buffer
          serialBuffer.current += value;
        }
      }
    } catch (error) {
      console.error("Serial Read Error:", error);
    } finally {
      readerRef.current.releaseLock();
    }
  };

  const fetchFilesSerial = async () => {
    if (!writerRef.current) {
      alert("Please connect via serial first.");
      return;
    }

    setStatus('Fetching via Serial...');
    serialBuffer.current = ''; // Clear out old data
    
    try {
      // Send the listfiles command. 
      // We wrap it in unique markers so we can parse it out of the REPL echo.
      const cmd = 'puts "---FILESTART---"; puts [join [listfiles] "\\n"]; puts "---FILEEND---"\r\n';
      await writerRef.current.write(cmd);

      // Wait 500ms for the MCU to process and stream the data back
      setTimeout(() => {
        const output = serialBuffer.current;
        const startIndex = output.indexOf('---FILESTART---');
        const endIndex = output.indexOf('---FILEEND---');

        if (startIndex !== -1 && endIndex !== -1) {
          // Extract just the block between our markers
          const fileBlock = output.substring(startIndex + 15, endIndex).trim();
          
          // Split by newline and clean up the strings
          const fileList = fileBlock.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '' && !line.includes('---'));
            
          setFiles(fileList);
          setStatus('Serial Ready');
        } else {
          console.warn("Could not parse file list from MCU:", output);
          setStatus('Parse Error');
        }
      }, 500);
    } catch (err) {
      console.error("Write failed", err);
      setStatus('Serial Error');
    }
  };

  // ----------------------------------------------------------------
  // WIFI CONNECTION LOGIC (Legacy fallback)
  // ----------------------------------------------------------------

  const fetchFilesWifi = async () => {
    setStatus('Connecting to WiFi IP...');
    try {
      const targetUrl = `${deviceIp.replace(/\/$/, '')}/file/list`;
      const response = await fetch(targetUrl, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      const data = await response.text();
      const fileList = data.split('\n').filter(line => line.trim() !== '');
      setFiles(fileList);
      setStatus('WiFi Ready');
    } catch (err) {
      console.error("Fetch failed", err);
      setStatus('WiFi Connection Failed');
      setFiles([]);
    }
  };

  // ----------------------------------------------------------------
  // EXECUTION
  // ----------------------------------------------------------------

  const executeCode = async () => {
    if (connMode === 'serial' && writerRef.current) {
      // Execute directly over serial REPL
      await writerRef.current.write(code + '\r\n');
      alert("Code sent over Serial!");
    } else {
      // In the future, implement the WiFi /execute/ POST request here
      alert("Execution over WiFi not yet configured in UI.");
    }
  };

  // ----------------------------------------------------------------
  // RENDER UI
  // ----------------------------------------------------------------
  const modeButtonClass = (mode) => `flex-1 cursor-pointer border-0 p-2 ${
    connMode === mode ? 'bg-[#0e639c] text-white' : 'bg-transparent text-[#888] hover:text-white'
  }`;

  const statusClass = `mt-[15px] text-xs ${
    status.includes('Ready') || status.includes('Connected') ? 'text-[#4caf50]' : 'text-[#f44336]'
  }`;

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#1e1e1e]">
      
      {/* LEFT SIDEBAR: File Explorer & Connection */}
      <div className="flex w-80 flex-col border-r border-[#333] bg-[#252526] text-[#cccccc]">
        
        {/* Connection Panel */}
        <div className="border-b border-[#333] p-[15px]">
          <h3 className="mb-[15px] text-sm text-white">CONNECTION</h3>
          
          {/* Mode Tabs */}
          <div className="mb-[15px] flex overflow-hidden rounded bg-[#1e1e1e]">
            <button 
              onClick={() => setConnMode('serial')}
              className={modeButtonClass('serial')}
            >
              USB Serial
            </button>
            <button 
              onClick={() => setConnMode('wifi')}
              className={modeButtonClass('wifi')}
            >
              WiFi (IP)
            </button>
          </div>

          {/* Serial Controls */}
          {connMode === 'serial' && (
            <div>
              {!portRef.current ? (
                <button 
                  onClick={connectSerial}
                  className="w-full cursor-pointer rounded border-0 bg-[#4caf50] p-2.5 font-bold text-white transition-colors hover:bg-[#45a049]"
                >
                  🔌 Connect Device
                </button>
              ) : (
                <button 
                  onClick={fetchFilesSerial}
                  className="w-full cursor-pointer rounded border-0 bg-[#0e639c] p-2.5 text-white transition-colors hover:bg-[#1177bb]"
                >
                  🔄 Refresh File List
                </button>
              )}
            </div>
          )}

          {/* WiFi Controls */}
          {connMode === 'wifi' && (
            <div>
              <input 
                type="text" 
                value={deviceIp} 
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="http://192.168.x.x"
                className="mb-2.5 w-full rounded border border-[#555] bg-[#3c3c3c] p-2 text-white placeholder:text-[#888]"
              />
              <button 
                onClick={fetchFilesWifi}
                className="w-full cursor-pointer rounded border-0 bg-[#0e639c] p-2 text-white transition-colors hover:bg-[#1177bb]"
              >
                🔄 Refresh File List
              </button>
            </div>
          )}

          <div className={statusClass}>
            Status: {status}
          </div>
        </div>

        {/* File List */}
        <div className="grow overflow-y-auto p-[15px]">
          <h3 className="mb-2.5 text-sm text-white">FILE EXPLORER</h3>
          {files.length === 0 ? (
            <div className="text-xs italic text-[#666]">No files found. Connect to fetch.</div>
          ) : (
            <ul className="m-0 list-none p-0">
              {files.map((filename, index) => (
                <li 
                  key={index} 
                  className="flex cursor-pointer items-center border-b border-[#333] p-2 text-[13px] hover:bg-[#2a2d2e]"
                  onClick={() => alert(`In the future, clicking ${filename} will load its contents into the editor!`)}
                >
                  📄 <span className="ml-2">{filename}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Editor */}
      <div className="flex grow flex-col">
        <div className="flex justify-end border-b border-[#333] bg-[#1e1e1e] px-5 py-2.5">
          <button 
            onClick={executeCode}
            className="cursor-pointer rounded-md border-0 bg-[#4caf50] px-5 py-2.5 font-bold text-white transition duration-200 hover:bg-[#45a049] active:scale-95"
            >
            ▶ Execute Script
            </button>
        </div>
        <div className="grow">
          <Editor
            height="100%"
            defaultLanguage="tcl"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value)}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 20 } }}
          />
        </div>
      </div>
      
    </div>
  );
}
