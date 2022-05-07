//import Analytics from '@enderkingj/simpleanalytics';
import Analytics from '../index.js';
import http from 'node:http';
import serve from 'node-static';

var Serve = new serve.Server('./example');

var server = http.createServer();

server.on('request', (req, res) => {
  if (!Analytics(req, res)) return false;

  Serve.serve(req, res)
})

server.listen(8080)