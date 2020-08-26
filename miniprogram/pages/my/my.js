// miniprogram/pages/my/my.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.nav)
      this.setData({
        nav:parseInt(options.nav)
      })
  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:3})
    }

    if(app.globalData.openid){
      this.get_userInfo(app.globalData.openid)
    }
  },

  onGetUserInfo(e){
    app.my_login({userInfo:e.detail.userInfo},(r=>{
      wx.hideLoading()
      this.setData({
        userInfo:app.globalData.userInfo,
        id:app.globalData.openid,
        if_admin:app.globalData.if_admin
      })
    }))
  },

  onPageScroll(e){
    if(e.scrollTop/app.globalData.ratio>=310){
      wx.setNavigationBarTitle({
        title: app.globalData.userInfo.nickName,
      })
      this.setData({scroll:true})
    }
    else{
      wx.setNavigationBarTitle({
        title: '我的',
      })
      this.setData({scroll:false})
    }
  },

  async get_userInfo(id){
    var userInfo=await app.q('user',{_id:id},limit=1)
    userInfo=JSON.parse(userInfo)[0]

    app.globalData.openid=id
    app.globalData.userInfo=userInfo

    this.setData({
      userInfo,id
    })
    wx.setNavigationBarTitle({
      title:userInfo.nickName
    })
  },

})