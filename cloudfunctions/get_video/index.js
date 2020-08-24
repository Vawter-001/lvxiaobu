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
  console.log("followed",followed,event.followed_list)
  
  if(!followed)
    var res=await db.collection('video').limit(50)
          .orderBy('create_time','desc').get()
  else
    var res=await db.collection('video').where({_openid:_.in(event.followed_list)})
            .limit(50).orderBy('create_time','desc').get()
  res=res.data

  for(r in res){
    if(res[r]['liked'].indexOf(wxContext.OPENID)>=0){
      res[r]['ilike']=true
    }else{
      res[r]['ilike']=false
    }
    res[r]['ifollowed']=true
  }

  return {
    video_list:res
  }
}