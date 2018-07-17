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


// a user conection event
io.on('connection', function (socket) {

  let connectedUser = {};

  //a user connected to the Chat
  socket.on('connect to the chat', (user) => {
    connectedUser = user;
    socket.emit('chat history', messages);
    socket.emit('user list', users);
    console.log(`User ${connectedUser.nickname} connected`);
  });

  // a user is typing event
  socket.on('user is typing', (nickname) => {
    io.emit('user is typing', nickname);
  });

  // a user send message event
  socket.on('chat message', (msg) => {
    saveNewMessage(msg, messages);
    io.emit('chat message', msg);
  });

  //add new user event
  socket.on('new user', (user) => {
    addNewUser(socket, user, connectedUser);
    io.emit('user added', user);
    io.emit('new user', user);
     //wait 60 second and set online
    setTimeout(() => { io.emit('user online', user); changeStatusUser('online', user.nickname) }, 60000);
  });

  // when a user disconnects
  socket.on('disconnect', () => {
    let userLeftMsg = {
      name: connectedUser.name,
      nickname: connectedUser.nickname,
      message: '<b>@' + connectedUser.nickname + '</b> left the chat',
      time: new Date().toUTCString()
    };

    if (connectedUser.nickname != null) {
      saveNewMessage(userLeftMsg, messages);
      io.emit('chat message', userLeftMsg);
      io.emit('user just left', connectedUser); changeStatusUser('just left', connectedUser.nickname);
      //wait 60 second and set offline
      setTimeout(() => { io.emit('user offline', connectedUser); changeStatusUser('offline', connectedUser.nickname); }, 60000);
    }
  });

});


//save new message in the history function
function saveNewMessage(msg, messages) {
  if (msg.message !== '') {
    messages.push(msg);
  }
  // FIFO
  if (messages.length > 100) {
    messages.shift();
  }
}

// add new user function
function addNewUser(socket, user, connectedUser) {
  users.forEach(item => {
    if (item.nickname === user.nickname) {
      user.nickname += Math.floor(Math.random() * 100);
      socket.emit('change nickname', user.nickname);
      connectedUser = user;
    }
  });
  users.push(user);
}

//change user status function
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
