// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var res=await db.collection('video').limit(50).orderBy('create_time','desc').get()

  return {
    video_list:res.data
  }
}