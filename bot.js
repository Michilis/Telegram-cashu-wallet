const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const {
    handleStart,
    handleReceiveToken,
    handleSendToken,
    handleCheckBalances,
    handlePayLnInvoice,
    handleHelp
} = require('./messages');

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_KEY);

bot.start(handleStart);
bot.command('receive_token', handleReceiveToken);
bot.command('send_token', handleSendToken);
bot.command('check_balances', handleCheckBalances);
bot.command('pay_ln_invoice', handlePayLnInvoice);
bot.command('help', handleHelp);

bot.action('receive_token', (ctx) => ctx.reply('Please send your encoded token.'));
bot.action('send_token', (ctx) => ctx.reply('Please send the amount and tokens.'));
bot.action('check_balances', handleCheckBalances);
bot.action('pay_ln_invoice', (ctx) => ctx.reply('Please send the Lightning invoice.'));
bot.action('help', handleHelp);

bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
    ctx.reply('An error occurred while processing your request.');
});

bot.launch().then(() => console.log('Bot is running...'));
