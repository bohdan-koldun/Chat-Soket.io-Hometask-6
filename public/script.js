(function () {
  let nameInput = document.getElementById('usernameInput');
  let nicknameInput = document.getElementById('nicknameInput');
  let inputMessage = document.getElementById('inputMessage');
  let loginButton = document.getElementById('button-enter');
  let sendMsgButton = document.getElementById('send-msg-btn');
  let messagesDiv = document.getElementById('messages');
  let counterMsg = document.getElementById('counter-msg');
  let userDiv = document.getElementById('users');
  let loginArea = document.getElementsByClassName('login')[0];
  let chatArea = document.getElementsByClassName('chat')[0];
  let typingDiv = document.getElementById('is-typing-block');

  let userName = 'User Name', userNickname = 'nickname';

  let socket = io.connect();

  //login in the Chat - click button
  loginButton.onclick = () => {
    userName = nameInput.value || 'User Name';
    userNickname = nicknameInput.value || 'nickname';
    loginArea.style.display = 'none';
    chatArea.style.display = 'block';
    nameInput.value = '', nicknameInput.value = '';

    let user = {
      name: userName,
      nickname: userNickname,
      status: 'just appeared',
      color: '#ff9800'
    };

    //send user  data to the server
    socket.emit('connect to the chat', user);
  };

  //upgrate nickname from the server
  socket.on('connect to the chat', (nickname) => {
    userNickname = nickname;
  });

  //add new user to the Chat event
  socket.on('added new user', (user) => {
    displayOneUser(user);
  });


  //send message to the Chat - click button or enter to send
  sendMsgButton.onclick = () => {
    sendMessageToServer();
  };

  inputMessage.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      sendMessageToServer();
    }
  });

  function sendMessageToServer() {
    let msg = {
      name: userName,
      nickname: userNickname,
      message: inputMessage.value,
      time: new Date().toUTCString()
    };

    // send new chat message to the server and clear input
    socket.emit('chat message', msg);
    inputMessage.value = '';
  }


  //get chat history data - event
  socket.on('chat history', (msgArr) => {
    messagesDiv.innerHTML = '';
    for (let i in msgArr) {
      if (msgArr.hasOwnProperty(i)) {
        displayOneMsg(msgArr[i], userNickname, msgArr.length);
      }
    }
  });

  //get user list data - event
  socket.on('user list', (userArr) => {
    userDiv.innerHTML = '';
    for (let i in userArr) {
      if (userArr.hasOwnProperty(i)) {
        displayOneUser(userArr[i]);
      }
    }
  });

  //get new message data - event
  socket.on('chat message', (msg) => {
    let length = (Number(counterMsg.innerHTML) + 1) % 101;
    displayOneMsg(msg, userNickname, length);
  });

  //get some user stats data - events
  socket.on('user online', (user) => {
    changeUserStatus(user, 'online')
  });

  socket.on('user just left', (user) => {
    changeUserStatus(user, 'just left')
  });

  socket.on('user offline', (user) => {
    changeUserStatus(user, 'offline')
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

  //display a message function
  function displayOneMsg(msg, nickname, length) {
    if (msg.message != '') {
      let elem = document.createElement('div');
      let regExp = new RegExp(`(^|\\s)@${nickname}(\\s|$)`);

      if (msg.message.search(regExp) !== -1) {
        elem.style.backgroundColor = "#dadada";
      }

      if (nickname == msg.nickname) {
        elem.innerHTML = `<text class="right-message">${msg.message}</text><span>${msg.name} <b>@${msg.nickname}</b><br> <i>${msg.time} </i></span>`;
        elem.style.gridTemplateColumns = '1fr 200px';
      }
      else {
        elem.innerHTML = `<span>${msg.name} <b>@${msg.nickname}</b><br> <i>${msg.time} </i></span><text>${msg.message}</text>`;
      }

      messagesDiv.appendChild(elem);

      counterMsg.innerHTML = length;

      //auto scroll to bottom
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  //display a User function
  function displayOneUser(user) {
    let elem = document.createElement('div');

    if (userNickname == user.nickname) {
      elem.innerHTML = `<li><i class="fa fa-circle" id="icon-${user.nickname}"></i>${user.name}<b> (me)</b> <br><b>@${user.nickname}</b><br><span class="status" id="status-${user.nickname}">${user.status}</span></li>`;
    }
    else {
      elem.innerHTML = `<li><i class="fa fa-circle" id="icon-${user.nickname}"></i>${user.name} <br><b>@${user.nickname}</b><br><span class="status" id="status-${user.nickname}">${user.status}</span></li>`;
    }

    userDiv.appendChild(elem);
    document.getElementById(`icon-${user.nickname}`).style.color = user.color;
  }

  //change status a user function
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