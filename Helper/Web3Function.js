
const axios = require('axios');
const utils = require("ethereumjs-util");


async function CheckTransectionHistory (walletAddress,chainObject)
{
    try{
      let todayDate = new Date();
      let oneMonthAgoDate = new Date();
      oneMonthAgoDate.setMonth(todayDate.getMonth() - 10);
      let todayFormatted = todayDate.toISOString().split('T')[0]
      let oneMonthAgoDateFormatted = oneMonthAgoDate.toISOString().split('T')[0]
        const query = `
    {
      ${chainObject.chain} {
        transfers(
          date: {since: "${oneMonthAgoDateFormatted}", till: "${todayFormatted}"} 
          sender: {is: "${walletAddress}"}
         
        ) {
          amount(calculate : sum , in : USD)
          currency {
            symbol
          }
          transaction {
            hash
          }
          block {
            timestamp {
              time(format: "%Y-%m-%d %H:%M:%S")
            }
          }
        }
      }
    }`;
      const response = await axios.post(
        'https://graphql.bitquery.io',
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': "BQYtndQyJgg5ih1s3FWsTYEhyVWY2jWB",
          },
        }
      );
      if (response.data.errors) {
        console.log(response.data.errors)
        return false;
      }
      
      const transfers = response.data.data[chainObject.symbol].transfers;
      if (!transfers || transfers.length === 0) {
        return false;
      }
      
      // Use 'some' to check if any transfer meets the condition
      const hasLargeTransfer = transfers.some(transfer => transfer.amount >= 5);
      
      return hasLargeTransfer;
    }
    catch(err)
    {
        throw err
    }
}

async function CheckNftHistory (walletAddress,contractAddress)
{
  try
  {
    const query = `
{
  EVM(network: eth) {
    transfers: transfers() {
      transaction {
        hash
      }
    }
  }
}

`;
    const response = await axios.post(
      'https://graphql.bitquery.io',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': "BQYtndQyJgg5ih1s3FWsTYEhyVWY2jWB",
        },
      }
    );
    console.log(response.data.errors[0])
    
  }
  catch(error)
  {
    throw error
  }
}
// setTimeout(async ()  =>  {
//   let c = await CheckNftHistory("0xB09540Cdb198d8ae82710e95c53C6CDebc7680a8","0x0054ef36214005b3f3878536b07900002eb7f46c")
//   console.log(c)
//   }, 3000);

async function verifyEthSign(walletAddress, signature) {
  const r = utils.toBuffer(signature.slice(0, 66));
  const s = utils.toBuffer("0x" + signature.slice(66, 130));
  const v = parseInt(signature.slice(130, 132), 16);

  // The message that was signed (in this case, the wallet address itself)
  const message = walletAddress;

  // Create the prefixed message hash
  const messageBuffer = Buffer.from(message.slice(2), 'hex'); // remove "0x" and convert to buffer
  const prefix = Buffer.from(`\x19Ethereum Signed Message:\n${messageBuffer.length}`);
  const prefixedMessageHash = utils.keccak256(Buffer.concat([prefix, messageBuffer]));

  // Recover the public key from the signature
  const pubKey = utils.ecrecover(prefixedMessageHash, v, r, s);
  const recoveredAddress = "0x" + utils.pubToAddress(pubKey).toString("hex");
  return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
}

module.exports ={
  CheckTransectionHistory,
  CheckNftHistory,
  verifyEthSign
}