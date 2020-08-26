// miniprogram/pages/blog_detail/blog_detail.js
const app=getApp()
const db=wx.cloud.database()
const _=db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    height:app.globalData.total_height/app.globalData.ratio-360
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var iliked=false;
    if(app.globalData.blog.liked.indexOf(app.globalData.openid)){
      iliked=true
    }
    this.setData({
      blog:app.globalData.blog,
      id:app.globalData.openid,
      iliked
    })
  },

  //喜欢视频，增加视频的喜欢列表，增加博主的喜欢量
  async like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    //把用户id，push进liked列表中
    var data={
      liked:_.push(app.globalData.openid)
    }
    this.setData({
      ilike:true
    })
    await app.update('blog',this.data.blog._id,data,false) 
    
    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(1)
    }
    await app.update('user',this.data.blog._openid,data2,false)
  },

  //取消喜欢
  async cancel_like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    //把用户id，push进liked列表中
    var data={
      liked:_.pull(app.globalData.openid)
    }
    
    this.setData({
      ilike:false
    })
    await app.update('blog',this.data.blog._id,data,false) 

    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(-1)
    }
    await app.update('user',this.data.blog._openid,data2,false)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})