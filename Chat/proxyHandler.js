
const messageSendHandler = {
  set: function (target, property, value) {
    if (property !== 'length')
      console.log(`User send message ${value.message}`);
    target[property] = value;
    return true;
  }
};


module.exports = messageSendHandler;
