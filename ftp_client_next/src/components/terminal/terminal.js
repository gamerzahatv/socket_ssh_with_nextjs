import React, { useState } from 'react';
import Terminal, { ColorMode, Output } from 'react-terminal-ui';

const TerminalController = () => {
  const [terminalLineData, setTerminalLineData] = useState([
    <Output>Welcome to the React Terminal UI Demo!</Output>
  ]);

  const handleInput = (terminalInput) => {
    console.log(`New terminal input received: '${terminalInput}'`);
  };

  return (
    <>
    <br/>
    <br/>
    <br/>
    <div className="container">
      <Terminal
        name="React Terminal Usage Example"
        colorMode={ColorMode.Light}
        onInput={handleInput}
        output={terminalLineData}
      />
    </div>
    </>
  );
};

export default TerminalController;