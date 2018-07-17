let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let port = 3000;


let messages = [], users = [];

// Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/public/css/style.css', (req, res) => {
  res.sendFile(__dirname + '/public/css/style.css');
});

app.get('/public/script.js', (req, res) => {
  res.sendFile(__dirname + '/public/script.js');
});


// Chatroom
io.on('connection', function (socket) {

  let connectedUser = '';

  // user connected to the Chat
  socket.on('connect to the chat', (user) => {
    connectedUser = user;
    socket.emit('chat history', messages);
    socket.emit('user list', users);
    console.log(`User ${connectedUser.name} connected`);
  });

  // user is typing event
  socket.on('user is typing', (nickname) => {
    io.emit('user is typing', nickname);
  });

  // a user send message
  socket.on('chat message', (msg) => {
    saveNewMessage(msg, messages);
    io.emit('chat message', msg);
  });

  //add new user
  socket.on('new user', (user) => {
    addNewUser(user);
    io.emit('new user', user);
    setTimeout(() => { io.emit('user online', user); changeStatusUser('online', user.nickname) }, 60000);
  });

  // when the user disconnects. 
  socket.on('disconnect', () => {
    let userLeftMsg = {
      name: connectedUser.name,
      nickname: connectedUser.nickname,
      message: '<b>@' + connectedUser.nickname + '</b> left the chat',
      time: new Date().toUTCString()
    };

    if (connectedUser.nickname != null) {
      saveNewMessage(userLeftMsg, messages);
      io.emit('user just left', connectedUser); changeStatusUser('just left', connectedUser.nickname);
      setTimeout(() => { io.emit('user offline', connectedUser); changeStatusUser('offline', connectedUser.nickname); }, 60000);
    }
  });

});


//function - saving new message
function saveNewMessage(msg, messages) {
  if (msg.message !== '') {
    messages.push(msg);
  }
  // FIFO
  if (messages.length > 100) {
    messages.shift();
  }
}

function addNewUser(user) {
   if(user){
     users.forEach(item => {
       if(item.nickname === user.nickname){
        user.nickname += Math.floor(Math.random() * 100);
       }
     });
     users.push(user);
   }
}

function changeStatusUser(status, nickname) {
  users.forEach(item => {
    if (item.nickname === nickname) {
      item.status = status;
      if (status == 'online') {
        item.color = '#00b75d';
      } else if (status == 'just left') {
        item.color = 'red';
      } else if (status == 'offline') {
        item.color = '#2b1111';
      }
    }
  });
}

// conect to server
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});