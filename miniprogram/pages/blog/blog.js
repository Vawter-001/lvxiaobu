// miniprogram/pages/blog/blog.js
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cate:['推荐','关注','美景','美食','人文','冒险','国外','乡村'],
    nav:0,
    height:app.globalData.total_height/app.globalData.ratio-70
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.get_blogs()
  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:1})
    }
  },

  to_edit_blog(){
    wx.navigateTo({
      url: '../edit_blog/edit_blog',
    })
  },

  async get_blogs(data={followed:false,where:{}}){
    wx.showLoading({title: '获取数据'})
    var that=this;
    await wx.cloud.callFunction({
      name:'get_blogs',
      data:data
    }).then(res=>{
      wx.hideLoading()
      that.setData({
        blog_list:res.result.blog_list
      })
    }).catch(err=>{
      wx.showToast({
        title: '获取数据失败',
        icon:'none'
      })
      console.error('err',err)
    })
  },

  change_nav(e){
    this.setData({
      nav:parseInt(e.currentTarget.dataset.index),
      blog_list:[]
    })
    if(this.data.nav===0){
      this.get_blogs({followed:false,where:{}})
    }
    else if(this.data.nav===1){
      this.get_blogs({followed:true,followed_list:app.globalData.userInfo.followed})
    }
    else{
      this.get_blogs({followed:false,where:{labels:this.data.cate[this.data.nav]}})
    }
  },
  swiper_nav(e){
    this.change_nav({'currentTarget':{'dataset':{'index':e.detail.current}}})
  },

})