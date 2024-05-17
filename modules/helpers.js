const { Telegraf } = require('telegraf');

const createYesNoButtons = (text, yesCallback, noCallback) => {
    return Telegraf.Extra.markup((markup) => {
        return markup.inlineKeyboard([
            [markup.callbackButton('Yes', yesCallback), markup.callbackButton('No', noCallback)]
        ]).resize();
    });
};

module.exports = {
    createYesNoButtons,
};
