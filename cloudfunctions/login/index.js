// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db=cloud.database()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var user_data=await db.collection('user').where({_id:wxContext.OPENID}).get()
  //console.log("user_data",user_data)
  if(user_data.data.length<=0){
    await db.collection('user').doc(wxContext.OPENID).set({
      data:{
        ...event.userInfo,
        create_time:new Date()
      }
    })
    var user_data={...event.userInfo,_id:wxContext.OPENID}
  }
  else user_data=user_data.data[0]
  return {
    userInfo:user_data
  }
}

