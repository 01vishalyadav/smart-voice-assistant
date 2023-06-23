import logo from './logo.svg';
import './App.css';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import RecordRTC from 'recordrtc'
import hark from 'hark'

import React, {useState, useEffect} from 'react';


function App() {
  var video;
  var default_h1;
  var h1
  var recorder;

  useEffect(() => {
    h1 = document.querySelector('h1');
    default_h1 = h1.innerHTML;
    video = document.querySelector('video');

    document.getElementById('btn-start-recording').onclick = function() {
      this.disabled = true;
      captureCamera(function(camera) {
          video.muted = true;
          video.srcObject = camera;
  
          recorder = RecordRTC(camera, {
              type: 'audio'
          });
  
          recorder.startRecording();
  
          var max_seconds = 3;
          var stopped_speaking_timeout;
          var speechEvents = hark(camera, {});
  
          speechEvents.on('speaking', function() {
              if(recorder.getBlob()) return;
  
              clearTimeout(stopped_speaking_timeout);
  
              if(recorder.getState() === 'paused') {
                  // recorder.resumeRecording();
              }
              
              h1.innerHTML = default_h1;
          });
  
          speechEvents.on('stopped_speaking', function() {
              if(recorder.getBlob()) return;
              // use recorder.getBlob to get media stream
  
              // recorder.pauseRecording();
              stopped_speaking_timeout = setTimeout(function() {
                  document.getElementById('btn-stop-recording').click();
                  h1.innerHTML = 'Recording is now stopped.';
              }, max_seconds * 1000);
  
              
              // just for logging purpose (you ca remove below code)
              var seconds = max_seconds;
              (function looper() {
                  h1.innerHTML = 'Recording is going to be stopped in ' + seconds + ' seconds.';
                  seconds--;
  
                  if(seconds <= 0) {
                      h1.innerHTML = default_h1;
                      return;
                  }
  
                  setTimeout(looper, 1000);
              })();
          });
  
          // release camera on stopRecording
          recorder.camera = camera;
  
          document.getElementById('btn-stop-recording').disabled = false;
      });
    };
    document.getElementById('btn-stop-recording').onclick = function() {
      this.disabled = true;
      recorder.stopRecording(stopRecordingCallback);
  };
  }, []);
    
    

    

  function captureCamera(callback) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(camera) {
      callback(camera);
    }).catch(function(error) {
      alert('Unable to get audio');
      console.error(error);
    });
  }

  function stopRecordingCallback() {
    video.srcObject = null;
    var blob = recorder.getBlob();
    video.src = URL.createObjectURL(blob);

    recorder.camera.stop();
    video.muted = false;
  }



  return (
    <div className="App">
      <main>
        <h2>Smart Voice Assistant</h2>

        <h1>Auto Stop RecordRTC on Silence</h1>
        <button id="btn-start-recording">Press before Speaking</button>
        <button id="btn-stop-recording">Stop Recording</button>
        <video controls autoPlay playsInline></video>
      </main>
    </div>
  );
}

export default App;