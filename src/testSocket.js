/* eslint-disable @typescript-eslint/no-var-requires */
const io = require('socket.io-client');

const socketClient = io('ws://localhost:8888/session');

socketClient.on('connect', () => {
  console.log('connection server');
});

socketClient.emit('message', 'hello world', (data) => {
  console.log(data);
});
