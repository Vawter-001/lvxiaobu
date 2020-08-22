// miniprogram/pages/my/my.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:3})
    }
    this.setData({
      id:app.globalData.openid,
      userInfo:app.globalData.userInfo,
    })
  },

  onGetUserInfo(e){
    app.my_login({userInfo:e.detail.userInfo},(r=>{
      wx.hideLoading()
      app.globalData.userInfo=e.detail.userInfo
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



})