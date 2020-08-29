// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database()
const _=db.command

// 云函数入口函数
exports.main = async (event, context) => {
  
  var res=await db.collection('user').where({_id:_.in(event.user_list)})
          .limit(50).get()
  res=res.data

  return {
    user_list:res
  }
}