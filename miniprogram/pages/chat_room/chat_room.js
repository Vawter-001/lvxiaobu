const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: true,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'radar-001',
    chatRoomCollection: 'ChatRoom',
    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
  },

  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title:options.f_nick_name,
    })

    this.setData({
      onGetUserInfo:this.onGetUserInfo,
      getOpenID: this.getOpenID,
      chatRoomGroupId: options.GroupId,
      chatRoomGroupName: options.f_nick_name,
      avatarUrl: options.avatar_url,
      userInfo:JSON.parse(options.userInfo),
      logged: true,
      scroll_height:app.globalData.total_height/app.globalData.ratio-120
    })
  },

  getOpenID:function() {
    return app.globalData.openid
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  //在页面返回时，修改全部消息为已读，并修改message页面的未读消息列表
  onUnload(){
    wx.cloud.callFunction({
      name:'read_message',
      data:{GroupId:this.data.chatRoomGroupId}
    })

    //执行onUnload时，把消息列表页面，的未读消息列表，清空
    let pages = getCurrentPages();//拿到页面栈
    let message_page;
    for(let i in pages){//拿到message页面
      if(pages[i]['route']=='pages/message/message'){
        message_page=pages[i]
        break;
      }
    }
    if(message_page){//拿到message页面的，未读消息列表
      let unread_list=message_page.data.unread_list
      unread_list[this.data.chatRoomGroupId]=0//把此聊天室的未读消息列表清空
      message_page.setData({
        unread_list:unread_list
      })
    }
  },
})
