// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  let {id}=event

  var total=await db.collection('danmu').where({video_id:id}).count()

  var total_num=total.total

  if(total_num==0){
    return{
      danmu_list:[]
    }
  }

  var danmu_list=await db.collection('danmu').where({video_id:id})
                  .orderBy('time','asc').limit(total_num).get()
  danmu_list=danmu_list.data

  return{
    danmu_list:danmu_list
  }
}