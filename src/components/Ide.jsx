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

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', background: '#1e1e1e' }}>
      
      {/* LEFT SIDEBAR: File Explorer & Connection */}
      <div style={{ width: '320px', background: '#252526', color: '#cccccc', display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
        
        {/* Connection Panel */}
        <div style={{ padding: '15px', borderBottom: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#fff' }}>CONNECTION</h3>
          
          {/* Mode Tabs */}
          <div style={{ display: 'flex', marginBottom: '15px', background: '#1e1e1e', borderRadius: '4px', overflow: 'hidden' }}>
            <button 
              onClick={() => setConnMode('serial')}
              style={{ flex: 1, padding: '8px', border: 'none', background: connMode === 'serial' ? '#0e639c' : 'transparent', color: connMode === 'serial' ? 'white' : '#888', cursor: 'pointer' }}
            >
              USB Serial
            </button>
            <button 
              onClick={() => setConnMode('wifi')}
              style={{ flex: 1, padding: '8px', border: 'none', background: connMode === 'wifi' ? '#0e639c' : 'transparent', color: connMode === 'wifi' ? 'white' : '#888', cursor: 'pointer' }}
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
                  style={{ width: '100%', padding: '10px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🔌 Connect Device
                </button>
              ) : (
                <button 
                  onClick={fetchFilesSerial}
                  style={{ width: '100%', padding: '10px', background: '#0e639c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
                style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#3c3c3c', border: '1px solid #555', color: 'white', borderRadius: '4px', boxSizing: 'border-box' }}
              />
              <button 
                onClick={fetchFilesWifi}
                style={{ width: '100%', padding: '8px', background: '#0e639c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔄 Refresh File List
              </button>
            </div>
          )}

          <div style={{ marginTop: '15px', fontSize: '12px', color: status.includes('Ready') || status.includes('Connected') ? '#4caf50' : '#f44336' }}>
            Status: {status}
          </div>
        </div>

        {/* File List */}
        <div style={{ padding: '15px', flexGrow: 1, overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fff' }}>FILE EXPLORER</h3>
          {files.length === 0 ? (
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#666' }}>No files found. Connect to fetch.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {files.map((filename, index) => (
                <li 
                  key={index} 
                  style={{ padding: '8px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2a2d2e'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => alert(`In the future, clicking ${filename} will load its contents into the editor!`)}
                >
                  📄 <span style={{ marginLeft: '8px' }}>{filename}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Editor */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 20px', background: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={executeCode}
            style={{ 
                padding: '10px 20px', 
                background: '#4caf50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                transition: 'transform 0.1s, background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#45a049'}
            onMouseOut={(e) => e.target.style.background = '#4caf50'}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            >
            ▶ Execute Script
            </button>
        </div>
        <div style={{ flexGrow: 1 }}>
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