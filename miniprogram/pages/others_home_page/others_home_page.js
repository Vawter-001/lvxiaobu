// miniprogram/pages/others_home_page/others_home_page.js
const app=getApp()
var id;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    id=options.id
    console.log('id',id)
    this.get_userInfo(id)
  },

  onPageScroll(e){
    if(e.scrollTop/app.globalData.ratio>=310){
      this.setData({scroll:true})
    }
    else{
      this.setData({scroll:false})
    }
  },

  async get_userInfo(id){
    var userInfo=await app.q('user',{_id:id},limit=1)
    userInfo=JSON.parse(userInfo)[0]
    this.setData({
      userInfo
    })
    wx.setNavigationBarTitle({
      title:userInfo.nickName
    })
  },

})