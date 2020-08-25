// miniprogram/pages/edit_userInfo/edit_userInfo.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    words_num:0,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      intro:app.globalData.userInfo.intro
    })
  },

  get_intro(e){
    this.setData({
      intro:e.detail.value,
      words_num:(e.detail.value).length
    })
  },

  async save(){
    await app.update('user',app.globalData.openid,{intro:this.data.intro})
  }
})