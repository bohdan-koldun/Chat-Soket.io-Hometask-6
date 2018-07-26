const Message = require('./message.js');
const User = require('./user.js');
const СhatRepository = require('./chatRepository.js');
const TIME_DELAY_CHANGE_STATUS = 6000;


class Chat {

    constructor(io) {
        this.connectedUser = null;
        this.chatRepository = new СhatRepository();

        io.on('connection', function (socket) {
            //this.initialUserConectionEvent(io, socket);
           this.initialUserDisconectionEvent(io, socket);
          //  this.initialUserSendMessageEvent(io, socket);
         //   this.initialUserTypingEvent(io, socket)
        });
    }


    initialUserConectionEvent(io, socket) {
        socket.on('connect to the chat', userData => {

            let { name, nickname, status, color } = userData;
            this.connectedUser = new User(name, nickname, status, color);
            this.connectedUser = this.chatRepository.addUser(this.connectedUser);

            socket.emit('connect to the chat', this.connectedUser.nickname);
            io.emit('added new user', this.connectedUser);

            setTimeout(() => {
                let result = this.chatRepository.changeStatusUser('online', this.connectedUser);
                io.emit(result, this.connectedUser);
            },
                TIME_DELAY_CHANGE_STATUS);

            socket.emit('chat history', this.chatRepository.messages);
            socket.emit('user list', this.chatRepository.users);

            console.log(`User ${this.connectedUser.nickname} connected`);
        });
    }

    initialUserDisconectionEvent(io, socket) {
        socket.on('disconnect', () => {
            if (this.connectedUser) {
                let userLeftMsg = new Message(this.connectedUser.name, this.connectedUser.nickname, `<b>@${this.connectedUser.nickname}</b> left the chat`);

                if (this.connectedUser.nickname != null) {
                    this.chatRepository.addMessage(userLeftMsg);

                    io.emit('chat message', userLeftMsg);

                    let result = this.chatRepository.changeStatusUser('just left', this.connectedUser);
                    io.emit(result, this.connectedUser);
                    setTimeout(() => {
                        let result = this.chatRepository.changeStatusUser('offline', this.connectedUser);
                        io.emit(result, this.connectedUser);
                    },
                        TIME_DELAY_CHANGE_STATUS);
                }
            }
        });
    }


    initialUserSendMessageEvent(io, socket) {
        socket.on('chat message', (msg) => {
            this.chatRepository.addMessage(msg);
            io.emit('chat message', msg);
        });
    }

    initialUserTypingEvent(io, socket) {
        socket.on('user is typing', (nickname) => {
            io.emit('user is typing', nickname);
        });
    }

}

module.exports = Chat;