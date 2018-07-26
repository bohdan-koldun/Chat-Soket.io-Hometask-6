class BotRequest {
    create(type) {
        let request;
        if (type === 'weather') {
            request = new RequestWeather()
        } else if (type === 'money exchange') {
            request = new RequestMoneyExchange()
        } else if (type === 'notes') {
            request = new RequestNotes()
        } else if (type === 'advise') {
            request = new RequestAdvise()
        }
        else if (type === 'quotes') {
            request = new RequestQuotes()
        }

        request.type = type
        request.getResponse = function () {
            console.log(`${this.type}: rate ${this.rate}/hour`)
        }

        return request;
    }
}


class RequestWeather {
    constructor() {
        this.rate = '$12'
    }
}

class RequestMoneyExchange {
    constructor() {
        this.rate = '$11'
    }
}

class RequestNotes {
    constructor() {
        this.rate = '$10'
    }
}

class RequestAdvise {
    constructor() {
        this.rate = '$15'
    }
}

class RequestQuotes {
    constructor() {
        this.rate = '$15'
    }
}

module.exports = BotRequest;