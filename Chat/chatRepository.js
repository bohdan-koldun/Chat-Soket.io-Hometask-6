const MESSAGE_HISTORY_LENGTH = 100;


class ChatRepository {
  constructor(proxyHandler, messages = [], users = []) {
    this.messages =  new Proxy( messages, proxyHandler);
    this.users = users;
  }

  addMessage(msg) {
    if (msg.message !== '') {
      this.messages.push(msg);
    }
    if (this.messages.length > MESSAGE_HISTORY_LENGTH) {    // FIFO
      this.messages.shift();
    }
  }

  addUser(newUser) {
    this.users.forEach(user => {
      if (user.nickname === newUser.nickname) {
        newUser.nickname += Math.floor(Math.random() * 100);
      }
    });

    this.users.push(newUser);
    return newUser;
  }

  changeStatusUser(status, user) {
    this.users.forEach(item => {
      if (item.nickname === user.nickname) {
        const result = item.changeStatus(status);
        return result;
      }
    });
  }

}

module.exports = ChatRepository;
