// miniprogram/pages/message/message.js
const app = getApp()
const db=wx.cloud.database()
const _=db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fens_num:0,
    like_num:0,
    comments_num:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.spy()
    this.spy_message()
  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:2})
    }
    //渲染消息通知
    this.getTabBar().setData({
      inform:app.globalData.inform
    })
  },

  //监听用户点赞数据、评论数据以及粉丝数据的变化
  //产生变化后，给对应的栏目添加red——dot
  spy(){
    var that=this;

    db.collection("inform").where({
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

  //此处为监听消息列表
  spy_message(){
    var that=this;
    db.collection('GroupId').where({
      members:app.globalData.openid,
      new_message:_.neq("")
    }).orderBy('update_time','desc')
    .watch({
      onChange: function(snapshot) {
        var cl=snapshot.docs
        for(let c in cl){
          //获取每一个聊天室，对方的id。并存入chat_list[i]['f_openid']中
          if(cl[c]['members'][0]==app.globalData.openid){
            var f_openid=cl[c]['members'][1]
            cl[c]['f_data']=cl[c]['members_data'][f_openid]
          }
          else{
            var f_openid=cl[c]['members'][0]
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
  //此处为获取消息列表的未读消息数量
  //当onHide聊天室页面时，会清空未读消息
  get_unread_message(){
    var that=this;
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