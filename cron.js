const cron = require("node-cron");
const {ReferralHistory,User,FlashPoints} = require("./model/db");
const {CheckTransectionHistory,CheckNftHistory} = require("./Helper/Web3Function")
const { Op } = require('sequelize');
exports.runCronJob = async () => {
    cron.schedule("0 * * * *", async () => {
        console.log("running a task every Hour");
        checkTransection()
        checkNFT()
    });
}
async function checkTransection() {
    try {
    let chainArray = [{chain:`ethereum(network: ethereum)`,symbol:"ethereum"},{chain:`bsc: ethereum(network: bsc)`,symbol:"bsc"},{chain:`polygon: ethereum(network: polygon)",symbol:"polygon`}]
    let isActiveData = await ReferralHistory.findAll({
        where: {
          isActiveRewarded: false,
          createdAt: {
            [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        },
        include: [{ model: User, as: "referrer" }]
      });
      for (let i =0 ; i < isActiveData.length ; i ++)
      {
          if(isActiveData[i].referrer.walletAddress)
          {
            for (let j =0 ; j < chainArray.length ; j ++)
            {
              let checkTransectionsHistoryData = await CheckTransectionHistory (isActiveData[i].referrer.walletAddress,chainArray[j]);
              if(checkTransectionsHistoryData)
              {
                await User.update({isActive:true},{where:{id:isActiveData[i].referrer.id}})
                await ReferralHistory.update({isActiveRewarded:true},{where:{id:isActiveData[i].id}})
                await FlashPoints.create({user_id:isActiveData[i].user1,points:100,description:"Earned 100 Points for referring a Active User"})
                break ;
              }
            }
          }
          
      }
      console.log("END ++++");
     
  
    } catch (error) {
      console.log("error in cron ::::", error);
    }
  }

async function checkNFT() {
    try {
    let isActiveData = await ReferralHistory.findAll({
        where: {
          isNFTRewarded: false,
          createdAt: {
            [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        },
        include: [{ model: User, as: "referrer" }]
      });
      for (let i =0 ; i < isActiveData.length ; i ++)
      {
          if(isActiveData[i].referrer.walletAddress)
          {
                let checkNFTHistoryData = await  CheckNftHistory(isActiveData[i].referrer.walletAddress);
                let points = 0 ;
                if(checkNFTHistoryData == "Bronze")
                {
                  points = 5
                }
                else if(checkNFTHistoryData == "Silver")
                {
                  points = 15
                }
                else if(checkNFTHistoryData == "Gold")
                {
                  points = 35
                }
                else if(checkNFTHistoryData == "Legendary")
                {
                  points = 50
                }
                if(points != 0)
                {
                  await ReferralHistory.update({isNFTRewarded:true},{where:{id:isActiveData[i].id}})
                  await FlashPoints.create({user_id:isActiveData[i].user1,points:points,description:`Earned Extra Points ${points} for having a NFT`})
                }
          }
          
      }
      console.log("END ++++");
     
  
    } catch (error) {
      console.log("error in cron ::::", error);
    }
  }

  // setTimeout(async ()  =>  {
  //   checkNFT()
  // }, 3000);
  