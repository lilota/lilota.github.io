import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function Ide() {
  const [code, setCode] = useState('# Write your TCL code here\nputs "Hello Lilota!"\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '1rem', background: '#1e1e1e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Lilota IDE</h2>
        <div>
          <button style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Run Code
          </button>
        </div>
      </div>
      
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="tcl"
          theme="vs-dark" // Switched to dark theme for a better coding feel
          value={code}
          onChange={(value) => setCode(value)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 20 }
          }}
        />
      </div>
    </div>
  );
}