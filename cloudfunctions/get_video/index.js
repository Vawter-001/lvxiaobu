// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var res=await db.collection('video').limit(50).orderBy('create_time','desc').get()
  res=res.data

  for(r in res){
    if(res[r]['liked'].indexOf(wxContext.OPENID)>=0){
      res[r]['ilike']=true
    }else{
      res[r]['ilike']=false
    }
  }

  return {
    video_list:res
  }
}