// miniprogram/pages/others_home_page/others_home_page.js
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
    this.setData({
      userInfo:app.globalData.userInfo
    })
    wx.setNavigationBarTitle({
      title: app.globalData.userInfo.nickName,
    })
  },

  onPageScroll(e){
    if(e.scrollTop/app.globalData.ratio>=310){
      this.setData({scroll:true})
    }
    else{
      this.setData({scroll:false})
    }
  },

})