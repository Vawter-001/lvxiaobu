// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const $ = db.command.aggregate
const util=require('./util.js')
// 云函数入口函数
exports.main = async (event, context) => {
  let {id}=event

  var total=await db.collection('comments').where({blog_id:id}).count()

  var total_num=total.total

  if(total_num==0){
    return{
      comment_list:[]
    }
  }

  //使用聚合分组，获取所有评论数据
  var comment_list=await db.collection('comments').aggregate()
    .match({blog_id:id}).sort({create_time:-1}).limit(total_num)
    .group({
      _id:'$comment_id',
      comment_data:$.addToSet({
        send_user_id:'$send_user_id',
        send_user_nickName:'$send_user_nickName',
        send_user_avatarUrl:'$send_user_avatarUrl',
        text:'$text',
        to_user_id:'$to_user_id',
        to_user_nickName:'$to_user_nickName',
        to_user_avatarUrl:'$to_user_avatarUrl',
        rank:'$rank',
        blog_id:'$blog_id',
        comment_id:'$comment_id',
        _id:'$_id',
        _openid:'$_openid',
        create_time:'$create_time'
      })
    })
    .end()
  comment_list=comment_list.list
  console.log("c_l",comment_list)

  //把comment_list的create_time变为字符串形式
  for(let i in comment_list){
    for(let j in comment_list[i]['comment_data']){
      comment_list[i]['comment_data'][j]['create_time']=util.order_date(new Date(comment_list[i]['comment_data'][j]['create_time']))
    }
  }

  //构造最终的数据格式，final_list格式为：
  //[{rank1:{一级评论数据},rank2:[{此一级评论下的二级评论},{二级评论}]},……]
  var final_list=[]
  var rank1_list=comment_list[0]['comment_data']
  console.log("rank1_list",rank1_list)

  for(var i=0;i<rank1_list.length;i++){
    var rank1=rank1_list[i]
    var rank2=[]
    for(var j=1;j<comment_list.length;j++){
      if(rank1_list[i]['_id']==comment_list[j]['_id']){
        rank2=comment_list[j]['comment_data']
      }
    }
    final_list.push({rank1:rank1,rank2:rank2})
    console.log("ranks",rank2)
  }

  return{
    comment_list:final_list
  }

}