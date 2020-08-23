// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  let {id}=event

  var total=await db.collection('danmu').where({video_id:id})
            .orderBy('video_time','asc').count()

  var total_num=total.total

  var danmu_list=await db.collection('danmu').aggregate().match({video_id:id})
                  .sort({video_time:-1}).limit(total_num)
                  .group({
                    _id:'$video_time',
                    comments: $.addToSet({content:'$content',color:'$color'})
                  }).end()
              
  danmu_list=danmu_list.list
  //console.log("danmu_list",danmu_list)

  var n_d={}
  for(d in danmu_list){
    n_d[[danmu_list[d]['_id']]]=danmu_list[d]['comments']
  }
  //console.log("n_d",n_d)
  return{
    danmu_list:n_d
  }
}