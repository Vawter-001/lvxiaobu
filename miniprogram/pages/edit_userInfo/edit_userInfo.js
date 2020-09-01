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
      intro:app.globalData.userInfo.intro,
      nickName:app.globalData.userInfo.nickName
    })
  },

  get_intro(e){
    this.setData({
      intro:e.detail.value,
      words_num:(e.detail.value).length
    })
  },

  get_nickName(e){
    this.setData({
      nickName:e.detail.value
    })
  },

  async save(){
    // if(!this.data.nickName){
    //   wx.showToast({
    //     title: '昵称不可为空',
    //     icon:'none'
    //   })
    //   return
    // }
    // await app.update('user',app.globalData.openid,{intro:this.data.intro,nickName:this.data.nickName})

    await app.update('user',app.globalData.openid,{intro:this.data.intro})
  }
})