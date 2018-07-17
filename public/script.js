(function () {
  let nameInput = document.getElementById('usernameInput');
  let nicknameInput = document.getElementById('nicknameInput');
  let inputMessage = document.getElementById('inputMessage');
  let loginButton = document.getElementById('button-enter');
  let sendMsgButton = document.getElementById('send-msg-btn');
  let messagesDiv = document.getElementById('messages');
  let userDiv = document.getElementById('users');
  let loginArea = document.getElementsByClassName('login')[0];
  let chatArea = document.getElementsByClassName('chat')[0];
  let typingDiv = document.getElementById('is-typing-block');

  let userName = 'User Name';
  let userNickname = 'nickname';

  let socket = io.connect();

  //login in the Chat
  loginButton.onclick = () => {
    userName = nameInput.value || 'User Name';
    userNickname = nicknameInput.value || 'nickname';
    loginArea.style.display = 'none';
    chatArea.style.display = 'block';

    let user = {
      name: userName,
      nickname: userNickname,
      status: 'just appeared',
      color: '#ff9800'
    };

    socket.emit('new user', user);
  };

  socket.on('user added', (user) => {
    socket.emit('connect to the chat', user);
  });


  //send message to the Chat
  sendMsgButton.onclick = () => {
    let data = {
      name: userName,
      nickname: userNickname,
      message: inputMessage.value,
      time: new Date().toUTCString()
    };

    // send new chat message event to the server
    socket.emit('chat message', data);
    inputMessage.value = '';
  };


  //get chat history event
  socket.on('chat history', (msgArr) => {
    messagesDiv.innerHTML = '';
    for (let i in msgArr) {
      if (msgArr.hasOwnProperty(i)) {
        displayOneMsg(msgArr[i], userNickname);
      }
    }
  });

  //get user list event
  socket.on('user list', (userArr) => {
    userDiv.innerHTML = '';
    for (let i in userArr) {
      if (userArr.hasOwnProperty(i)) {
        displayOneUser(userArr[i]);
      }
    }
  });


  //new message event
  socket.on('chat message', (msg) => {
    displayOneMsg(msg, userNickname);
  });

  //user stats events
  socket.on('new user', (user) => {
    displayOneUser(user);
  });

  socket.on('user online', (user) => {
    changeUserStatus(user, 'online')
  });

  socket.on('user just left', (user) => {
    changeUserStatus(user, 'just left')
  });

  socket.on('user offline', (user) => {
    changeUserStatus(user, 'offline')
  });


  //change duplicate nickname
  socket.on('change nickname', (nickname) => {
    userNickname = nickname;

  });

  // user is typing event
  inputMessage.onkeyup = function () {
    socket.emit('user is typing', userNickname);
  };

  socket.on('user is typing', (nickname) => {
    if (nickname !== userNickname) {
      let spanNickname = document.getElementById(nickname);

      if (spanNickname == null) {
        let spanNickname = document.createElement('span');
        spanNickname.id = nickname;
        spanNickname.innerHTML = `@${nickname} is typing...&nbsp;`;
        typingDiv.appendChild(spanNickname);

        setTimeout(function () { spanNickname.style.display = 'none'; }, 3000);
      }
      else {
        spanNickname.style.display = 'block';

        setTimeout(function () { spanNickname.style.display = 'none'; }, 3000);
      }

    }
  });

  //display Message
  function displayOneMsg(msg, nickname) {
    if (msg.message != '') {
      let elem = document.createElement('div');
      if (msg.message.indexOf('@' + nickname + ' ') !== -1) {
        elem.style.backgroundColor = "#dadada";
      }

      elem.innerHTML = `<span>${msg.name} <b>@${msg.nickname}</b><br> <i>${msg.time} </i></span><text>${msg.message}</text>`;
      messagesDiv.appendChild(elem);
    }
  }

  //display User
  function displayOneUser(user) {
    let elem = document.createElement('div');
    elem.innerHTML = `<li><i class="fa fa-circle" id="icon-${user.nickname}"></i>${user.name} <br><b>@${user.nickname}</b><br><span class="status" id="status-${user.nickname}">${user.status}</span></li>`;
    userDiv.appendChild(elem);
    document.getElementById(`icon-${user.nickname}`).style.color = user.color;
  }

  //change status
  function changeUserStatus(user, newstatus) {

    let statusText = document.getElementById(`status-${user.nickname}`);
    let statusIcon = document.getElementById(`icon-${user.nickname}`);

    if (statusText != null) {
      statusText.innerHTML = newstatus;

      if (newstatus == 'online') {
        statusIcon.style.color = '#00b75d';
      } else if (newstatus == 'just left') {
        statusIcon.style.color = 'red';
      } else if (newstatus == 'offline') {
        statusIcon.style.color = '#2b1111';
      }
    }

  }



})();