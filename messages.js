const { Markup } = require('telegraf');
const { createMainMenu, createYesNoButtons } = require('./modules/helpers');
const { createWallet, receiveToken, sendToken, payLnInvoice, checkBalances, saveUsers, loadUsers } = require('./modules/wallet');
const { checkCashuFunds } = require('./modules/cashuChecker');

const handleStart = async (ctx) => {
    const users = loadUsers();
    const userId = ctx.from.id.toString();
    if (!users[userId]) {
        const wallet = await createWallet(process.env.DEFAULT_MINT_URL);
        users[userId] = { wallet, mintURL: process.env.DEFAULT_MINT_URL };
        saveUsers(users);
        ctx.reply('Welcome! Your wallet has been created.', createMainMenu());
    } else {
        ctx.reply('Welcome back!', createMainMenu());
    }
};

const handleReceiveToken = async (ctx) => {
    const users = loadUsers();
    const userId = ctx.from.id.toString();
    const user = users[userId];
    if (!user) {
        return ctx.reply('Please create a wallet first by sending /start.');
    }
    const encodedToken = ctx.message.text.split(' ')[1];
    if (!encodedToken) {
        return ctx.reply('Please provide an encoded token.');
    }
    try {
        const { token, tokensWithErrors } = await receiveToken(user.wallet, encodedToken);
        saveUsers(users);
        ctx.reply(`Token received: ${JSON.stringify(token)}`);
    } catch (error) {
        console.error(error);
        ctx.reply(`Error receiving token: ${error.message}`);
    }
};

const handleSendToken = async (ctx) => {
    const users = loadUsers();
    const userId = ctx.from.id.toString();
    const user = users[userId];
    if (!user) {
        return ctx.reply('Please create a wallet first by sending /start.');
    }
    const [command, amount, ...tokens] = ctx.message.text.split(' ');
    if (!amount || tokens.length === 0) {
        return ctx.reply('Please provide an amount and tokens.');
    }
    try {
        const { returnChange, send } = await sendToken(user.wallet, Number(amount), { token: tokens.map(t => ({ proofs: [t] })) });
        saveUsers(users);
        ctx.reply(`Tokens sent: ${JSON.stringify(send)}, Change: ${JSON.stringify(returnChange)}`);
    } catch (error) {
        console.error(error);
        ctx.reply(`Error sending token: ${error.message}`);
    }
};

const handleCheckBalances = async (ctx) => {
    const users = loadUsers();
    const userId = ctx.from.id.toString();
    const user = users[userId];
    if (!user) {
        return ctx.reply('Please create a wallet first by sending /start.');
    }
    try {
        const balance = await checkBalances(user.wallet);
        ctx.reply(`Your balance is: ${balance} sats`);
    } catch (error) {
        console.error(error);
        ctx.reply(`Error checking balance: ${error.message}`);
    }
};

const handlePayLnInvoice = async (ctx) => {
    const users = loadUsers();
    const userId = ctx.from.id.toString();
    const user = users[userId];
    if (!user) {
        return ctx.reply('Please create a wallet first by sending /start.');
    }
    const invoice = ctx.message.text.split(' ')[1];
    if (!invoice) {
        return ctx.reply('Please provide a Lightning invoice.');
    }
    try {
        const decodedInvoice = decodeInvoice(invoice);
        ctx.replyWithMarkdown(`Do you want to pay this invoice?\n*Amount:* ${decodedInvoice.amount}\n*Description:* ${decodedInvoice.memo}`, 
        createYesNoButtons(
            'Yes',
            async () => {
                try {
                    const paymentResult = await payLnInvoice(user.wallet, decodedInvoice, decodedInvoice.amount);
                    ctx.reply(`Invoice paid successfully! Preimage: ${paymentResult.preimage}`);
                } catch (error) {
                    console.error(error);
                    ctx.reply(`Error paying invoice: ${error.message}`);
                }
            },
            () => ctx.reply('Payment cancelled.')
        ));
    } catch (error) {
        console.error(error);
        ctx.reply(`Error decoding invoice: ${error.message}`);
    }
};

const handleHelp = (ctx) => {
    const helpMessage = `
*Available Commands:*
/start - Start the bot and create a wallet
/receive_token <encoded_token> - Receive a Cashu token
/send_token <amount> <tokens> - Send a Cashu token
/check_balances - Check the balance of your wallet
/pay_ln_invoice <invoice> - Pay a Lightning invoice
/help - Display this help message
`;
    ctx.replyWithMarkdown(helpMessage, createMainMenu());
};

module.exports = {
    handleStart,
    handleReceiveToken,
    handleSendToken,
    handleCheckBalances,
    handlePayLnInvoice,
    handleHelp,
};
