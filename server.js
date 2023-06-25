const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('config')
const bodyParser = require('body-parser')
const path = require('path');

const app = express();
const server = http.createServer(app);
global.appRoot = path.resolve(__dirname);

// Static files
app.use(express.static(path.resolve(__dirname, `${config.get('staticFilePath')}`)));

require('./startup/routes')(app);
require('./startup/config')(app);

// for rest of the routes that is not in api
app.get('/*', function (req, res) {
  res.sendFile(path.resolve(__dirname,config.get('staticFilePath'), 'index.html'));
});


// make server listen on PORT
const PORT = process.env.PORT || 3333;
server.listen(PORT, ()=> {
  console.log(`listening on port ${PORT}`);
});