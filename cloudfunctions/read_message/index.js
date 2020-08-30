// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const _=db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  await db.collection('ChatRoom').where({
    GropuId:event.GropuId,
    status:'unread',
    _openid:_.neq(wxContext.OPENID)
  }).update({
    data:{
      status:'read'
    }
  })

  return{
    status:true
  }
}