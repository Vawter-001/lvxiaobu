
// miniprogram/pages/message/message.js
const app = getApp()
const db=wx.cloud.database()
const _=db.command
var spy_lcf;
var spy_cl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fens_num:0,
    like_num:0,
    comments_num:0,
    unread_list:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.spy()//监听点赞、粉丝、评论变化
    this.spy_chat_list()//监听消息列表变化
  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:2})
    }
  },

  //监听用户点赞数据、评论数据以及粉丝数据的变化
  //产生变化后，给对应的栏目添加red——dot
  spy(){
    var that=this;

    spy_lcf=db.collection("inform").where({
      to_user_id:app.globalData.openid,
      status:'unread'
    }).watch({
      onChange: function(snapshot) {
        that.sort_data(snapshot.docs)
      },
      onError: function(err) {
        console.error('the watch closed because of error',err)
      }
    })
  },
  //整理变化后的数据，以获取red-dot的数量
  sort_data(inform_data){
    var fens_num=0,like_num=0,comments_num=0;
    for(let i in inform_data){
      if(inform_data[i]['lcf_type']=='fens'){
        fens_num+=1
      }
      else if(inform_data[i]['lcf_type']=='like'){
        like_num+=1
      }
      else if(inform_data[i]['lcf_type']=='comments'){
        comments_num+=1
      }
    }
    this.setData({fens_num,like_num,comments_num})
  },

  //此处为监听消息列表的变化
  //只有当消息列表变化时，才会重新监听新列表的未读消息变化
  //最新消息变化时，获取新的未读消息列表
  spy_chat_list(){
    var that=this;
    var cl=[];
    var cl_id=[];

    spy_cl=db.collection('GroupId').where(
      _.and([
        _.or([
          {member1:app.globalData.openid},
          {member2:app.globalData.openid},
        ]),
        {new_message:_.exists(true)}
      ])
    )
    .watch({
      onChange: function(snapshot){
        console.log("snapshot_message",snapshot)

        //此处，循环changesDoc列表
        //判断更新的数据，是否在原数组中
        //如果在就执行else，更新，如果不在就执行if进行push
        for(let i in snapshot.docChanges){
          if(!snapshot.docChanges[i]['doc']['update_time']){
            continue
          }
          var cl_index=cl_id.indexOf(snapshot.docChanges[i]['docId'])
          if(cl_index<0){
            cl.push(snapshot.docChanges[i]['doc'])
            cl_id.push(snapshot.docChanges[i]['docId'])
          }
          else{
            cl[cl_index]=snapshot.docChanges[i]['doc']
          }
        }

        cl.sort(that.sortBy('update_time'))

        for(let c in cl){
          //获取每一个聊天室，对方的数据
          if(cl[c]['member1']==app.globalData.openid){
            var f_openid=cl[c]['member2']
            cl[c]['f_data']=cl[c]['members_data'][f_openid]
          }
          else{
            var f_openid=cl[c]['member1']
            cl[c]['f_data']=cl[c]['members_data'][f_openid]
          }
        }
        that.setData({
          chat_list:cl
        })
        that.get_unread_message()
      },
      
      onError: function(err) {
        console.error('the watch closed because of error',err)
      }
    })
  },
  sortBy(field1,field2){
    return function(a,b) {
      if(a[field1]<b[field1]){
        return 1
      }
      else if(a[field1]==b[field1]){
        if(a[field2]<=b[field2]){
          return 1
        }
        else{
          return -1
        }
      }
      else{
        return -1
      }
    }
  },

  //此处为监听未读消息数量，为对象格式，{'groupId':1,'grougId2':1}
  //当onHide聊天室页面时，会清空使用页面栈，清空对应groupId的未读消息数量
  get_unread_message(){
    var that=this;
    if(that.data.chat_list.length<=0){
      return
    }
    //调用云函数，上传消息列表，获得消息列表的未读消息数组
    wx.cloud.callFunction({
      name:'get_unread_message',
      data:{chat_list:that.data.chat_list}
    }).then(res=>{
      that.setData({
        unread_list:res.result.unread_list
      })
    }).catch(err=>{
      console.error('err',err)
    })
  },

  //进入通知列表
  to_inform(e){
    wx.navigateTo({
      url: '../inform/inform?lcf_type='+e.currentTarget.dataset.lcf_type,
    })
  },
  
  //浏览用户主页
  to_others_home_page(e){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    wx.navigateTo({
      url: '../others_home_page/others_home_page?id='+e.currentTarget.dataset._id+'&nav=1',
    })
  },

  //获取聊天室id,进入聊天室
  enter_chat:function(e){
    var GroupId=e.currentTarget.dataset.group_id
    var f_nickName=e.currentTarget.dataset.nick_name//对方的昵称

    wx.navigateTo({
      url: '../chat_room/chat_room?GroupId='+GroupId+'&avatar_url='+app.globalData.userInfo.avatarUrl+'&userInfo='+JSON.stringify(app.globalData.userInfo)+'&f_nick_name='+f_nickName,
    })

  },

})