// miniprogram/pages/inform/inform.js
const app=getApp()
const db=wx.cloud.database()
const _=db.command

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
    var lcf_type=options.lcf_type
    if(lcf_type=='like'){
      wx.setNavigationBarTitle({
        title: '收到的赞',
      })
    }
    else if(lcf_type=='comments'){
      wx.setNavigationBarTitle({
        title: '评论我的',
      })
    }
    else if(lcf_type=='fens'){
      wx.setNavigationBarTitle({
        title: '我的粉丝',
      })
    }
    this.setData({lcf_type})
    this.get_inform(lcf_type)
  },

  get_inform(lcf_type){
    var that=this;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'get_inform',
      data:{lcf_type}
    }).then(res=>{
      wx.hideLoading()
      that.setData({
        inform_list:res.result.inform_list
      })
    }).catch(err=>{
      wx.showToast({
        title: '加载失败',
        icon:'none'
      })
      console.error('err',err)
    })
  },

  to_others_home_page(e){
    wx.navigateTo({
      url: '../others_home_page/others_home_page?id='+e.currentTarget.dataset._openid,
    })
  },

  to_detail(e){
    var inform=e.currentTarget.dataset.inform
    if(inform.vb_type=='video'){
      var a=inform.post_id
      wx.navigateTo({
        url: '../preview_work/preview_work?video_array='+JSON.stringify([a])+'&index=0',
      })
    }
    else if(inform.vb_type=='blog'){
      wx.navigateTo({
        url: "../blog_detail/blog_detail?_id="+inform.post_id+"&mode=normal",
      })
    }
  },


})