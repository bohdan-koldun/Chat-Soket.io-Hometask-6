class Message {
    constructor(name, nickname, message) {
      this.name = name;
      this.nickname = nickname;
      this.message = message;
      this.time = new Date().toUTCString();
    }
}

module.exports = Message;