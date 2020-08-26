// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database()
const _=db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var followed=event.followed
  
  if(!followed)
    var res=await db.collection('blog').where(event.where)
          .orderBy('create_time','desc').limit(50).get()
  else
    var res=await db.collection('blog').where({_openid:_.in(event.followed_list)})
            .limit(50).orderBy('create_time','desc').get()
  res=res.data

  return {
    blog_list:res
  }
}