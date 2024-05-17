const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const {
    handleStart,
    handleCreateWallet,
    handleReceiveToken,
    handleSendToken,
    handleCheckBalances,
    handlePayLnInvoice,
    handleHelp
} = require('./messages');

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

bot.start(handleStart);
bot.command('create_wallet', handleCreateWallet);
bot.command('receive_token', handleReceiveToken);
bot.command('send_token', handleSendToken);
bot.command('check_balances', handleCheckBalances);
bot.command('pay_ln_invoice', handlePayLnInvoice);
bot.command('help', handleHelp);

bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
    ctx.reply('An error occurred while processing your request.');
});

bot.launch().then(() => console.log('Bot is running...'));
