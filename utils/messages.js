const moment = require('moment');
// function to convert string message into an object
function formatMessage(username, text) { 
    return {
        username:username,
        text:text,
        time:moment().format('h:mm a')

    }
}

module.exports = formatMessage;