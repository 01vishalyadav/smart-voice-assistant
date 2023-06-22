const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const voiceAssistant = require('../routes/voiceAssistant');



module.exports = function(app) {
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.use('/api/voiceAssistant/', voiceAssistant);
}