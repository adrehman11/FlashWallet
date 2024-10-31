const cron = require("node-cron");
const {ReferralHistory,User,FlashPoints} = require("./model/db");
const {CheckTransectionHistory} = require("./Helper/Web3Function")
const { Op } = require('sequelize');
exports.runCronJob = async () => {
    cron.schedule("0 * * * *", async () => {
        console.log("running a task every Hour");
        checkTransection()
        // checkNFT()
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
        include: [{ model: User, as: "referee" }]
      });
      for (let i =0 ; i < isActiveData.length ; i ++)
      {
          if(isActiveData[i].referee.walletAddress)
          {
            for (let j =0 ; j < chainArray.length ; j ++)
            {
              let checkTransectionsHistoryData = await CheckTransectionHistory (isActiveData[i].referee.walletAddress,chainArray[j]);
              if(checkTransectionsHistoryData)
              {
                await User.update({isActive:true},{where:{id:isActiveData[i].referee.id}})
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
    // let chainArray = [{chain:`ethereum(network: ethereum)`,symbol:"ethereum"},{chain:`bsc: ethereum(network: bsc)`,symbol:"bsc"},{chain:`polygon: ethereum(network: polygon)",symbol:"polygon`}]
    let isActiveData = await ReferralHistory.findAll({
        where: {
          isNFTRewarded: false,
          createdAt: {
            [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        },
        include: [{ model: User, as: "referee" }]
      });
      for (let i =0 ; i < isActiveData.length ; i ++)
      {
          if(isActiveData[i].referee.walletAddress)
          {
            for (let j =0 ; j < chainArray.length ; j ++)
            {
              let checkTransectionsHistoryData = await CheckTransectionHistory (isActiveData[i].referee.walletAddress,chainArray[j]);
              if(checkTransectionsHistoryData)
              {
                await User.update({isActive:true},{where:{id:isActiveData[i].referee.id}})
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

//   setTimeout(async ()  =>  {
//     checkTransection()
//   }, 3000);
  