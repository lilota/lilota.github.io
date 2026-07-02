import React from 'react'

export default function Documentation() {
  return (
    <section id="documentation" className="documentation">
      <div className="container">
        <h2 className="section-title">Quick Start Guide</h2>
        
        <div className="doc-section">
          <h3>Prerequisites</h3>
          <ul>
            <li>Supported Microcontroller: ESP32, ESP8266, Arduino Pico</li>
            <li>Computer with Linux, MacOS, or Windows</li>
            <li>USB data cable (Some are power delivery only)</li>
            <li>Serial programmer (for boards without built-in programmers)</li>
          </ul>
        </div>

        <div className="doc-section">
          <h3>Setup Methods</h3>
          <h4>Terminal Method</h4>
          <p>Follow the <a href="https://github.com/COMPAS-Lab/lilota/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">contributing guide</a> for terminal-based setup.</p>
          
          <h4>IDE Method</h4>
          <ol>
            <li>Install the lilota IDE</li>
            <li>Use IDE to flash built files onto esp/pico</li>
            <li>After flashing, a GUI menu will pop up to configure WiFi, MQTT, etc which can be brought up later in the device settings</li>
            <li>Create and edit files which can then be flashed onto the board</li>
          </ol>
        </div>

        <div className="doc-section">
          <h3>Basic TCL Syntax</h3>
          
          <h4>Comments</h4>
          <div className="code-example">
            <pre><span className="comment"># This is a comment</span>
<br /><span className="keyword">puts</span> 5; <span className="comment"># This is also a comment</span></pre>
          </div>

          <h4>Variables</h4>
          <div className="code-example">
            <pre><span className="keyword">set</span> led [gpio -mode out 12]
<br /><span className="keyword">set</span> num 5
<br /><span className="keyword">puts</span> <span className="variable">$num</span>;  <span className="comment"># Prints 5</span></pre>
          </div>

          <h4>GPIO Control</h4>
          <div className="code-example">
            <pre><span className="comment"># Create LED on pin 12</span>
<br /><span className="keyword">set</span> led [gpio -mode out 12]
<br /><span className="variable">$led</span> on;   <span className="comment"># Turn LED on</span>
<br /><span className="variable">$led</span> off;  <span className="comment"># Turn LED off</span>
<br />
<br /><span className="comment"># Create button on pin 5</span>
<br /><span className="keyword">set</span> button [gpio -mode in 5]
<br /><span className="variable">$button</span> change {'{'}
<br />    <span className="keyword">if</span> {'{'} <span className="variable">$value</span> {'}'} {'{'}
<br />        <span className="variable">$led</span> on
<br />    {'}'} <span className="keyword">else</span> {'{'}
<br />        <span className="variable">$led</span> off
<br />    {'}'}
<br />{'}'}</pre>
          </div>

          <h4>PWM Control</h4>
          <div className="code-example">
            <pre><span className="comment"># Create PWM on pin 27</span>
<br /><span className="keyword">set</span> buzzer [pwm -channel 0 -resolution 8 -frequency 440 27]
<br /><span className="variable">$buzzer</span> duty 0.5;  <span className="comment"># Set 50% duty cycle</span></pre>
          </div>

          <h4>Loops and Functions</h4>
          <div className="code-example">
            <pre><span className="comment"># For loop</span>
<br /><span className="keyword">for</span> {'{'} <span className="keyword">set</span> i 0 {'}'} {'{'} <span className="variable">$i</span> &lt; 5 {'}'} {'{'} <span className="keyword">incr</span> i {'}'} {'{'}
<br />    <span className="keyword">puts</span> <span className="variable">$i</span>
<br />{'}'}
<br />
<br /><span className="comment"># Function definition</span>
<br /><span className="keyword">proc</span> blinkLED {'{times}'} {'{'}
<br />    <span className="keyword">global</span> led
<br />    <span className="keyword">for</span> {'{'} <span className="keyword">set</span> i 0 {'}'} {'{'} <span className="variable">$i</span> &lt; <span className="variable">$times</span> {'}'} {'{'} <span className="keyword">incr</span> i {'}'} {'{'}
<br />        <span className="variable">$led</span> on
<br />        <span className="keyword">after</span> 500
<br />        <span className="variable">$led</span> off
<br />        <span className="keyword">after</span> 500
<br />    {'}'}
<br />{'}'}</pre>
          </div>
        </div>
        <div className="doc-section">
          <h4>See the <a href="https://github.com/lilota/lilota.github.io/blob/main/README.md#useage" target="_blank" rel="noreferrer">README</a> for more details.</h4>
        </div>
      </div>
    </section>
  )
}