import './App.css';
import React, { useState, useEffect } from 'react';
import RecordRTC from 'recordrtc'
import hark from 'hark'
import axios from "axios";


// uses hark library to detect silence
// uses recordrtc to record audio

function App() {
  useEffect(()=>{
    // having a bug in my front end code, due to which, page reloads in between
    // adding following code to prevent unnecessary reloads.
    window.onbeforeunload = function() {
      return "Please don't leave the page";
    }
  }, [])
  
  function startButtonClickedHandler(e) {
    e.preventDefault(); // to prevent form default relaod of the page
    e.target.disabled = true; // disable until processing request
    
    const h2 = document.querySelector('h2');
    const default_h1 = 'Listening...'
    captureAudio(audioStream => {
      // create recorder object of RecordRTC to record audio
      const recorder = RecordRTC(audioStream, {
        type: 'audio'
      });

      recorder.startRecording();
      let secondsForSilence = 3;
      let stoppedSpeakingTimeout;

      // usse hark library to create events based on 'silence'
      let speechEvents = hark(audioStream, {});
      speechEvents.on('speaking', function() {
        if(recorder.getBlob()) return;
        clearTimeout(stoppedSpeakingTimeout);
        h2.innerHTML = 'I\'m listening, you are speaking :)';
      });

      // After user stops speaking for 3 seconds, send request to backend
      speechEvents.on('stopped_speaking', () => {
        if(recorder.getBlob()){
          return;
        }
        stoppedSpeakingTimeout = setTimeout(function() {
          stopRecording(recorder)
          h2.innerHTML = 'Processing your audio and getting response';
        }, secondsForSilence * 1000);

        var seconds = secondsForSilence;
        (function looper() {
          h2.innerHTML = 'To stop listening in ' + seconds + ' seconds.';
          seconds--;
          if( seconds < 0) {
            h2.innerHTML = 'Processing your audio and getting response';
            return;
          }
          setTimeout(looper, 1000);
        })();
      });
      recorder.camera = audioStream;
    });
  }


  // function to capture audio from the user, as input
  function captureAudio(callback) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(camera) {
      callback(camera);
    }).catch(function(error) {
      alert('Unable to get audio');
      console.error(error);
    });
  }


  // function to stop recording and handling request and response to server
  function stopRecording(recorder) {
    recorder.stopRecording(()=> {
      // convert recorded audio into blob
      var blob = recorder.getBlob();
      recorder.camera.stop();
      // create form and send file in form to backend
      const FormData = require('form-data');
      let data = new FormData();
      // create file from blob object and send it to backend
      const audioInputFile = new File([blob], 'audioInputFile.webm', { type: blob.type })
      data.append('audioInputFile', audioInputFile);
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/api/voiceAssistant/assist',
        headers: { 
          ...data.getHeaders
        },
        data : data
      };
      // make request using having config
      axios.request(config)
      .then((response) => {
        const outputAudio = document.getElementById('out');
        outputAudio.src = response.data.audioOutputFilePath;
        outputAudio.muted = false;
        console.log('audio output tag:', outputAudio);
      })
      .catch((error) => {
        console.log(error);
      });
    })
  };
  function outputAudioEnded(e) {
    document.querySelector('h2').innerHTML="Press button again to Speak";
    document.querySelector('button').disabled=false;
  }


  return (
    <div className="App">
      <main>
        <h1>Smart Voice Assistant</h1>
        <h2>Start speaking after pressing the below button, it will detect silence!</h2>
        
        <audio controls autoPlay id='out' onEnded={e=>outputAudioEnded(e)}></audio>
        <br/>
        <br/>
        <br/>
        <button onClick={(e)=>startButtonClickedHandler(e)}>Press before Speaking</button>
        <br/>
        
      </main>
    </div>
  );
}

export default App;