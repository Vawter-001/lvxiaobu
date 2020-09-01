// miniprogram/pages/user_list/user_list.js
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
    if(options.type=='followed'){
      wx.setNavigationBarTitle({
        title: '关注列表',
      })
    }
    else{
      wx.setNavigationBarTitle({
        title: '粉丝列表',
      })
    }
    var user_list=JSON.parse(options.user_list)
    this.setData({type:options.type})
    this.get_users(user_list)
  },

  get_users(user_list){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'get_users',
      data:{user_list:user_list}
    }).then(res=>{
      wx.hideLoading()
      this.setData({
        user_list:res.result.user_list
      })
    }).catch(err=>{
      wx.showToast({
        title: '加载失败',
        icon:'none'
      })
      console.error('err',err)
    })
  },

})