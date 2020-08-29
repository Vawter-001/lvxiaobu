// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const _=db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var chat_list=event.chat_list
  var ids=[];
  for(let i in chat_list){
    ids.push(chat_list[i]['_id'])
  }

  var unread_list=await db.collection('ChatRoom').aggregate().match({
                  groupId:_.in(ids),
                  status:_.neq(wxContext.OPENID)
                }).group({
                  _id:'$groupId',
                  num:$.sum(1)
                }).end()

  unread_list=unread_list.list


  var unread_num=[]
  for(let i in ids){
    for(let j in unread_list){
      if(unread_list[j]['_id']==ids[i]){
        unread_num.push(unread_list[j]['num'])
        break
      }
    }
  }

  return {
    unread_list:unread_num
  }
}