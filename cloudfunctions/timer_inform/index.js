// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const _=db.command
const $=db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {

  //点赞、粉丝、评论
  var res=await db.collection('inform').aggregate().match({status:'unread'})
                .group({
                  _id:"$to_user_id",
                  count:$.sum(1)
                }).end()
  res=res.list

  //未读消息，这里，使用groupId和——openid分组，并限定条件未unread，则，查询出来的数据，都是openid发送的，而且对方未读的
  //通过groupId和openid，即可获取对方openid，并给他发送订阅消息提醒
  var res2=await db.collection('ChatRoom').aggregate().match({status:'unread'})
                .group({
                  _id:{
                    groupId:"$groupId",
                    _openid:'$_openid',
                  },
                  count:$.sum(1)
                }).end()
  res2=res2.list
  //console.log("res2",res2)

  //循环判断哪个人的数据达到了要求，就给哪个人发消息
  for(let i in res){
    if(res[i]['count']>=8){
      var data=['互动提醒','有很多人点赞、评论了您的作品','快去小程序看看吧～']
      await send_template(res[i]['_id'],data)
    }
  }

  //循环判断哪个人的数据达到了要求，就给哪个人发消息
  for(let j in res2){
    if(res2[j]['count']>=5){
      var to_openid=res2[j]['_id']['groupId'].replace(res2[j]['_id']['_openid'],'')
      var data=['消息提醒','有朋友给您发了私信','快去小程序看看吧～']
      await send_template(to_openid,data)
    }
  }

}

send_template=async(openid,data)=>{
  await cloud.openapi.subscribeMessage.send({
    touser:openid, //要推送给那个用户
    page: 'pages/index/index', //要跳转到小程序的哪个页面
    miniprogram_state:'developer',
    data: {//推送的内容
      //https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/subscribe-message/subscribeMessage.send.html
      //消息类型
      phrase8: {
        value: data[0]
      },
      //消息内容
      thing2: {
        value: data[1]
      },
      //备注
      thing7: {
        value: data[2]
      }
    },
    templateId: 'Piq5AJ2zbYkbfi-CkSvVRy-mPq6-bGQp9sC72DY1ybk' //模板id
  })
}