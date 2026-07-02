import React from 'react';

export default function Flash() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '100px' }}>
      <h1>Flash Lilota Firmware</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>Connect your ESP32 via USB and click the button below to flash.</p>
      
      <div className="installer-panel" style={{ padding: '2rem', background: 'white', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        {/* The esp-web-tools component */}
        <esp-web-install-button manifest="/flash/manifest.json"></esp-web-install-button>
      </div>
    </div>
  );
}