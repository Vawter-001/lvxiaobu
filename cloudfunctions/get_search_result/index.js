// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db=cloud.database()
const _=db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var table;
  var where;

  if(event.nav==0){
    table='user'
    where=_.or([
      {_id: db.RegExp({regexp:event.search_key,options: 'i',})},
      {nickName: db.RegExp({regexp:event.search_key,options: 'i',})},
      {intro: db.RegExp({regexp:event.search_key,options: 'i',})}
    ])
  }
  else if(event.nav==1){
    table='video'
    where=_.or([
      {point: db.RegExp({regexp:event.search_key,options: 'i',})},
      {user_nickName: db.RegExp({regexp:event.search_key,options: 'i',})},
      {title: db.RegExp({regexp:event.search_key,options: 'i',})}
    ])
  }
  else if(event.nav==2){
    table='blog'
    where=_.or([
      {title: db.RegExp({regexp:event.search_key,options: 'i',})},
      {html: db.RegExp({regexp:event.search_key,options: 'i',})}
    ])
  }

  var res=await db.collection(table).where(where).orderBy('create_time','asc').get()

  res=res.data

  return {
    search_result:res
  }
}