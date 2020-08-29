// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database()
const _=db.command
const util=require('./util.js')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var lcf_type=event.lcf_type
  
  //获取数据
  var res=await db.collection('inform').where({
      to_user_id:wxContext.OPENID,
      lcf_type:lcf_type,
    }).limit(50).orderBy('create_time','desc').get()
  res=res.data
  for(let i in res){
    res[i]['create_time']=util.order_date(new Date(res[i]['create_time']))
  }

  //更新unread为read
  await db.collection('inform').where({
    to_user_id:wxContext.OPENID,
    lcf_type:lcf_type,
    status:'unread'
  }).update({data:{status:'read'}})

  return {
    inform_list:res
  }
}