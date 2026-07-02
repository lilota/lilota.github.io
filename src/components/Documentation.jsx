import React from 'react'

export default function Documentation() {
  const docSectionClass = 'mb-12';
  const docHeadingClass = 'mb-4 border-b-2 border-[#e2e8f0] pb-2 text-2xl font-bold text-[#667eea]';
  const docSubheadingClass = 'mb-2 mt-6 text-xl font-bold text-[#4a5568]';
  const paragraphClass = 'mb-4 text-[#4a5568]';
  const listClass = 'mb-4 ml-8 list-disc text-[#4a5568]';
  const orderedListClass = 'mb-4 ml-8 list-decimal text-[#4a5568]';
  const listItemClass = 'mb-2';
  const codeClass = 'my-8 overflow-x-auto rounded-[10px] bg-[#1e1e1e] p-8 text-[#d4d4d4]';
  const preClass = 'm-0 font-mono text-[0.9rem]';
  const linkClass = 'font-semibold text-[#667eea] underline underline-offset-2 hover:text-[#4f5ed8]';
  const commentClass = 'text-[#6a9955]';
  const keywordClass = 'text-[#569cd6]';
  const variableClass = 'text-[#9cdcfe]';

  return (
    <section id="documentation" className="bg-white py-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="mb-12 text-center text-3xl font-bold text-[#333]">Quick Start Guide</h2>
        
        <div className={docSectionClass}>
          <h3 className={docHeadingClass}>Prerequisites</h3>
          <ul className={listClass}>
            <li className={listItemClass}>Supported Microcontroller: ESP32, ESP8266, Arduino Pico</li>
            <li className={listItemClass}>Computer with Linux, MacOS, or Windows</li>
            <li className={listItemClass}>USB data cable (Some are power delivery only)</li>
            <li className={listItemClass}>Serial programmer (for boards without built-in programmers)</li>
          </ul>
        </div>

        <div className={docSectionClass}>
          <h3 className={docHeadingClass}>Setup Methods</h3>
          <h4 className={docSubheadingClass}>Terminal Method</h4>
          <p className={paragraphClass}>Follow the <a className={linkClass} href="https://github.com/COMPAS-Lab/lilota/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">contributing guide</a> for terminal-based setup.</p>
          
          <h4 className={docSubheadingClass}>IDE Method</h4>
          <ol className={orderedListClass}>
            <li className={listItemClass}>Install the lilota IDE</li>
            <li className={listItemClass}>Use IDE to flash built files onto esp/pico</li>
            <li className={listItemClass}>After flashing, a GUI menu will pop up to configure WiFi, MQTT, etc which can be brought up later in the device settings</li>
            <li className={listItemClass}>Create and edit files which can then be flashed onto the board</li>
          </ol>
        </div>

        <div className={docSectionClass}>
          <h3 className={docHeadingClass}>Basic TCL Syntax</h3>
          
          <h4 className={docSubheadingClass}>Comments</h4>
          <div className={codeClass}>
            <pre className={preClass}><span className={commentClass}># This is a comment</span>
<br /><span className={keywordClass}>puts</span> 5; <span className={commentClass}># This is also a comment</span></pre>
          </div>

          <h4 className={docSubheadingClass}>Variables</h4>
          <div className={codeClass}>
            <pre className={preClass}><span className={keywordClass}>set</span> led [gpio -mode out 12]
<br /><span className={keywordClass}>set</span> num 5
<br /><span className={keywordClass}>puts</span> <span className={variableClass}>$num</span>;  <span className={commentClass}># Prints 5</span></pre>
          </div>

          <h4 className={docSubheadingClass}>GPIO Control</h4>
          <div className={codeClass}>
            <pre className={preClass}><span className={commentClass}># Create LED on pin 12</span>
<br /><span className={keywordClass}>set</span> led [gpio -mode out 12]
<br /><span className={variableClass}>$led</span> on;   <span className={commentClass}># Turn LED on</span>
<br /><span className={variableClass}>$led</span> off;  <span className={commentClass}># Turn LED off</span>
<br />
<br /><span className={commentClass}># Create button on pin 5</span>
<br /><span className={keywordClass}>set</span> button [gpio -mode in 5]
<br /><span className={variableClass}>$button</span> change {'{'}
<br />    <span className={keywordClass}>if</span> {'{'} <span className={variableClass}>$value</span> {'}'} {'{'}
<br />        <span className={variableClass}>$led</span> on
<br />    {'}'} <span className={keywordClass}>else</span> {'{'}
<br />        <span className={variableClass}>$led</span> off
<br />    {'}'}
<br />{'}'}</pre>
          </div>

          <h4 className={docSubheadingClass}>PWM Control</h4>
          <div className={codeClass}>
            <pre className={preClass}><span className={commentClass}># Create PWM on pin 27</span>
<br /><span className={keywordClass}>set</span> buzzer [pwm -channel 0 -resolution 8 -frequency 440 27]
<br /><span className={variableClass}>$buzzer</span> duty 0.5;  <span className={commentClass}># Set 50% duty cycle</span></pre>
          </div>

          <h4 className={docSubheadingClass}>Loops and Functions</h4>
          <div className={codeClass}>
            <pre className={preClass}><span className={commentClass}># For loop</span>
<br /><span className={keywordClass}>for</span> {'{'} <span className={keywordClass}>set</span> i 0 {'}'} {'{'} <span className={variableClass}>$i</span> &lt; 5 {'}'} {'{'} <span className={keywordClass}>incr</span> i {'}'} {'{'}
<br />    <span className={keywordClass}>puts</span> <span className={variableClass}>$i</span>
<br />{'}'}
<br />
<br /><span className={commentClass}># Function definition</span>
<br /><span className={keywordClass}>proc</span> blinkLED {'{times}'} {'{'}
<br />    <span className={keywordClass}>global</span> led
<br />    <span className={keywordClass}>for</span> {'{'} <span className={keywordClass}>set</span> i 0 {'}'} {'{'} <span className={variableClass}>$i</span> &lt; <span className={variableClass}>$times</span> {'}'} {'{'} <span className={keywordClass}>incr</span> i {'}'} {'{'}
<br />        <span className={variableClass}>$led</span> on
<br />        <span className={keywordClass}>after</span> 500
<br />        <span className={variableClass}>$led</span> off
<br />        <span className={keywordClass}>after</span> 500
<br />    {'}'}
<br />{'}'}</pre>
          </div>
        </div>
        <div className={docSectionClass}>
          <h4 className={docSubheadingClass}>See the <a className={linkClass} href="https://github.com/lilota/lilota.github.io/blob/main/README.md#useage" target="_blank" rel="noreferrer">README</a> for more details.</h4>
        </div>
      </div>
    </section>
  )
}
