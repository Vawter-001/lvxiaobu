// miniprogram/pages/my/my.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height:String(app.globalData.total_height/app.globalData.ratio-160)+'rpx',
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
  },

  onPageScroll(e){
    if(e.scrollTop/app.globalData.ratio>=310){
      wx.setNavigationBarTitle({
        title: '程序员方方',
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