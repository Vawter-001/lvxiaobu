// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db=cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  var GroupId=await query_GroupId(event.f_openid,event.Myopenid,event.members_data)
  return {GroupId:GroupId}
},
query_GroupId=async(f_openid,Myopenid,members_data)=>{
  const groups_num =await db.collection('GroupId').where({
    members: _.eq([f_openid,Myopenid]).or(_.eq([Myopenid,f_openid]))
  }).count()
  console.log("groups_num",groups_num.total)
  if(groups_num.total==0){//如果对方没有和自己创建过聊天，就新建一个聊天室，并返回聊天室id
    var group_id=await creat_GroupId(f_openid,Myopenid,members_data) 
    console.log("group_id",group_id)
    return group_id
  }
  else{//如果创建过，就直接返回聊天室id
    const groups_data =await db.collection('GroupId').where({
      members: _.eq([f_openid,Myopenid]).or(_.eq([Myopenid,f_openid]))
    }).get()
    console.log("group_id",groups_data.data[0].GroupId)
    return groups_data.data[0].GroupId
    //
  }
},
creat_GroupId=async(f_openid,Myopenid,members_data)=>{
  await db.collection('GroupId').add({
    data:{
      _id:f_openid+Myopenid,
      members:[f_openid,Myopenid],
      GroupId:f_openid+Myopenid,
      members_data:members_data,
      create_time:new Date(),
      member1:f_openid,
      member2:Myopenid
    }
  })
  return f_openid+Myopenid
}