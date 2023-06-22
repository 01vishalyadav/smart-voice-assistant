import logo from './logo.svg';
import './App.css';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded'
import ZoomVideo from '@zoom/videosdk'

import React, {useState, useEffect} from 'react';


function App() {
  function getVoice() {
    console.log('Button clicked!')
  }
  return (
    <div className="App">
      <main>
        <h2>Smart Voice Assistant</h2>
        <button onClick={getVoice}>Press to start</button>
      </main>
    </div>
  );
}

export default App;