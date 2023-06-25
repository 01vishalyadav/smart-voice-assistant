const config = require('config');

// logger, like winston, could have been configured.
module.exports = function(app) {
  if(!(config.get('openAI.apiKey')))
    throw new Error('FATAL ERROR: openAI api key is not defined');
  if(!(config.get('delOutputFileAfter')))
    throw new Error('FATAL ERROR: Delete output file after time is not set!');
  if(app.get('env') === 'production'){
    console.log('config static file path', config.get('staticFilePath'));
  }
  else if(app.get('env') === 'development'){
    
  }
}