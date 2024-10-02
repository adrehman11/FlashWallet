
const ETHERSCAN_API_KEY = 'YOUR_ETHERSCAN_API_KEY';
const WALLET_ADDRESS = '0xYourWalletAddress';
const ETHERSCAN_BASE_URL = `https://api.etherscan.io/api`;


async function CheckTransectionHistory (walletAddress)
{
    try{
        console.log(walletAddress)
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    }
    catch(err)
    {
        throw err
    }
}

module.exports ={
    CheckTransectionHistory
}