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

  onHide(){
    
  },

})
