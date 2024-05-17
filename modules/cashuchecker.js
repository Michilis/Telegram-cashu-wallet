const { checkProofsSpent } = require('@cashu/cashu-ts');

const checkCashuFunds = async (wallet, amount) => {
    const proofs = wallet.keys.map(key => key.proofs).flat();
    const spentProofs = await checkProofsSpent(proofs);
    const availableFunds = proofs.filter((_, index) => !spentProofs[index]).reduce((acc, proof) => acc + proof.amount, 0);
    return availableFunds >= amount;
};

module.exports = {
    checkCashuFunds,
};
