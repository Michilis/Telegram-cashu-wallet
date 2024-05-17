const { Markup } = require('telegraf');

const createInlineKeyboard = (buttons) => {
    return Markup.inlineKeyboard(buttons.map(button => Markup.button.callback(button.text, button.callback_data)));
};

const mainMenuButtons = [
    { text: 'Create Wallet', callback_data: 'create_wallet' },
    { text: 'Receive Token', callback_data: 'receive_token' },
    { text: 'Send Token', callback_data: 'send_token' },
    { text: 'Check Balances', callback_data: 'check_balances' },
    { text: 'Pay LN Invoice', callback_data: 'pay_ln_invoice' },
    { text: 'Help', callback_data: 'help' },
];

const createMainMenu = () => createInlineKeyboard(mainMenuButtons);

module.exports = {
    createInlineKeyboard,
    createMainMenu,
};
