
const axios = require('axios');


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
    const query = `{
      EVM(dataset: combined, network: polygon) {
        Transfers(
          limit: {count: 100}
          where: {
            Currency: {
              SmartContract: {is: "${contractAddress}"}
            }
            OR: [
              {Receiver: {is: "${walletAddress}"}}
            ]
          }
        ) {
          Currency {
            Name
            SmartContract {
              Address
            }
            Symbol
          }
          Receiver
          Sender
          Amount
          Transaction {
            Hash
          }
          Block {
            Number
            Time
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
    console.log(response)
    console.log(response.data.errors)
    
  }
  catch(error)
  {
    throw error
  }
}
// setTimeout(async ()  =>  {
//   let c = await CheckNftHistory("0xB09540Cdb198d8ae82710e95c53C6CDebc7680a8","0x0054ef36214005b3F3878536b07900002EB7f46C")
//   console.log(c)
//   }, 3000);


module.exports ={
  CheckTransectionHistory,
  CheckNftHistory
}