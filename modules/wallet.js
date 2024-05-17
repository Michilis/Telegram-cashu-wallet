const { CashuMint, CashuWallet, getDecodedToken, getEncodedToken, decodeInvoice, getFee } = require('@cashu/cashu-ts');
const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, '../users.json');

const loadUsers = () => {
    if (fs.existsSync(usersFilePath)) {
        return JSON.parse(fs.readFileSync(usersFilePath));
    }
    return {};
};

const saveUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const connectToMint = async (mintURL) => {
    const mint = new CashuMint(mintURL);
    const keysets = await mint.getKeySets();
    const keys = await mint.getKeys();
    return {
        mintURL: mint.mintUrl,
        keys: keys.keysets,
        keysets: keysets.keysets,
        isAdded: true,
    };
};

const createWallet = async (mintURL) => {
    const mintInfo = await connectToMint(mintURL);
    return new CashuWallet(mintInfo.mintURL, mintInfo.keys);
};

const receiveToken = async (wallet, encodedToken) => {
    const { token: decoded } = getDecodedToken(encodedToken);
    if (decoded) {
        const { token, tokensWithErrors } = await wallet.receive(encodedToken);
        return { token, tokensWithErrors };
    }
    throw new Error('Invalid token');
};

const sendToken = async (wallet, amountToSend, tokens) => {
    const proofs = tokens.token.map((t) => t.proofs).flat();
    const { returnChange, send } = await wallet.send(amountToSend, proofs);
    return { returnChange, send };
};

const payLnInvoice = async (wallet, invoice, amount) => {
    const { proofs } = await wallet.requestTokens(amount, invoice.hash);
    return await wallet.payLnInvoice(invoice.paymentRequest, proofs);
};

const checkBalances = async (wallet) => {
    const balances = await wallet.checkProofsSpent(wallet.keys);
    return balances.reduce((acc, { amount, spent }) => (spent ? acc : acc + amount), 0);
};

module.exports = {
    loadUsers,
    saveUsers,
    connectToMint,
    createWallet,
    receiveToken,
    sendToken,
    payLnInvoice,
    checkBalances,
};
