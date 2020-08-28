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
  var type=event.type
  
  if(type=='video')//刷新视频列表
    var res=await db.collection('video').where({_id:_.in(event.array)})
            .limit(50).orderBy('create_time','desc').get()
  else if(type=='blog')//刷新博客列表
    var res=await db.collection('blog').where({_id:_.in(event.array)})
            .limit(50).orderBy('create_time','desc').get()
  res=res.data

  for(let i in res){
    res[i]['create_time']=util.order_date(new Date(res[i]['create_time']))
  }

  for(r in res){
    if(res[r]['liked'].indexOf(wxContext.OPENID)>=0){
      res[r]['ilike']=true
    }else{
      res[r]['ilike']=false
    }
    res[r]['ifollowed']=true
  }

  return {
    list:res
  }
}