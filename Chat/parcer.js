class Parser {
    constructor(message) {
        this.message = message;

    }

    findBot() {
        let regExp = new RegExp(`(^)@bot(\\s|$)`);

        if (message.search(regExp) !== -1)
            console.log("@bot start");
    }

}

module.exports = Parser;