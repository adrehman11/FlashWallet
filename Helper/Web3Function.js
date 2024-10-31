
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
    const query = 
    `{
      ethereum(network: matic) {
        transfers(
          options: {limit: 100, desc: "block.height"} # Get latest transactions first
          smartContractAddress: {is: "${contractAddress}"}
          currency: {type: {is: "ERC721"}} # Target ERC721 NFTs
          any: [
            {receiver: {is: "${walletAddress}"}},
          ]
        ) {
          currency {
            name
            symbol
            address
            tokenId
          }
          receiver {
            address
          }
          sender {
            address
          }
          transaction {
            hash
          }
          block {
            height
            timestamp {
              time
            }
          }
        }
      }
    }`;
    // `{
    //   EVM(dataset: combined, network: polygon) {
    //     Transfers(
    //       limit: {count: 100}
    //       where: {
    //         Currency: {
    //           SmartContract: {is: "${contractAddress}"}
    //         }
    //         OR: [
    //           {Receiver: {is: "${walletAddress}"}}
    //         ]
    //       }
    //     ) {
    //       Currency {
    //         Name
    //         SmartContract {
    //           Address
    //         }
    //         Symbol
    //       }
    //       Receiver
    //       Sender
    //       Amount
    //       Transaction {
    //         Hash
    //       }
    //       Block {
    //         Number
    //         Time
    //       }
    //     }
    //   }
    // }`;
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
//   let c = await CheckTransectionHistory("0x02E7ABE4A3644134Bb06b9Be2629B19A7811B736",{chain:`ethereum(network: ethereum)`,symbol:"ethereum"})
//   console.log(c)
//   }, 3000);


module.exports ={
  CheckTransectionHistory,
  CheckNftHistory
}