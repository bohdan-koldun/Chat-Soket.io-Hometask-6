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
    connectedUser = addNewUser(user);
    socket.emit('connect to the chat', connectedUser.nickname);
    io.emit('added new user', connectedUser);
    //wait 60 second and set online
    setTimeout(() => { changeStatusUser('online', connectedUser) }, 60000);

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



  // when a user disconnects
  socket.on('disconnect', () => {
    let userLeftMsg = {
      name: connectedUser.name,
      nickname: connectedUser.nickname,
      message: '<b>@' + connectedUser.nickname + '</b> left the chat',
      time: new Date().toUTCString()
    };

    console.log(`User ${connectedUser.nickname} disconnected`);

    if (connectedUser.nickname != null) {
      saveNewMessage(userLeftMsg, messages);
      io.emit('chat message', userLeftMsg);
      changeStatusUser('just left', connectedUser);
      //wait 60 second and set offline
      setTimeout(() => { changeStatusUser('offline', connectedUser); }, 60000);
    }
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
  function addNewUser(user) {
    users.forEach(item => {
      if (item.nickname === user.nickname) {
        user.nickname += Math.floor(Math.random() * 100);
        connectedUser = user;
      }
    });
    users.push(user);
    return user;
  }

  //change user status function
  function changeStatusUser(status, user) {
    users.forEach(item => {
      if (item.nickname === user.nickname) {
        if (status == 'online' && item.status == 'just appeared') {
          item.status = status;
          item.color = '#00b75d';
          io.emit('user online', user);
        }
        else if (status == 'just left' && (item.status == 'online' || item.status == 'just appeared')) {
          item.status = status;
          item.color = 'red';
          io.emit('user just left', user);
        }
        else if (status == 'offline' && item.status == 'just left') {
          item.status = status;
          item.color = '#2b1111';
          io.emit('user offline', user);
        }
      }
    });
  }

});




// conect to server
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
