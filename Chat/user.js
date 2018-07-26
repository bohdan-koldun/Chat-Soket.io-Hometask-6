class User {
  constructor(name, nickname, status, color) {
    this.name = name;
    this.nickname = nickname;
    this.status = status;
    this.color = color;
  }

  changeStatus(status) {
    
    if (status == 'online' && this.status == 'just appeared') {
      this.status = status;
      this.color = '#00b75d';
      return 'user online';
    }

    else if (status == 'just left' && (this.status == 'online' || this.status == 'just appeared')) {
      this.status = status;
      this.color = 'red';
      return 'user just left';
    }

    else if (status == 'offline' && this.status == 'just left') {
      this.status = status;
      this.color = '#2b1111';
      return 'user offline';
    }

    return 'no change';
  }
}

module.exports = User;