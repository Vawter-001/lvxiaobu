// miniprogram/pages/search/search.js
const app=getApp()
const db=wx.cloud.database()
const _=db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav:1,
    height:app.globalData.total_height/app.globalData.ratio-150
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.nav){
      this.setData({
        nav:parseInt(options.nav)
      })
    }

  },

  get_search_key(e){
    this.setData({
      search_key:e.detail.value
    })
  },

  change_nav(e){
    this.setData({
      nav:parseInt(e.currentTarget.dataset.index)
    })
    this.search()
  },
  swiper_nav(e){
    this.change_nav({'currentTarget':{'dataset':{'index':e.detail.current}}})
  },

  //在云函数中，按照nav，构建where语句，并进行正则模糊查询
  search(e){
    var that=this;
    if(!that.data.search_key){
      return
    }

    wx.showLoading({
      title: '查询中',
    })

    wx.cloud.callFunction({
      name:'get_search_result',
      data:{nav:that.data.nav,search_key:that.data.search_key}
    }).then(res=>{
      wx.hideLoading()
      that.setData({
        search_result:res.result.search_result
      })
    }).catch(err=>{
      wx.hideLoading()
      console.err('err',err)
    })

  },

  //预览所有视频
  to_preview_work(e){
    var video_array=[]
    for(let i in this.data.video_works){
      video_array.push(this.data.video_works[i]['_id'])
    }
    wx.navigateTo({
      url: '/pages/preview_work/preview_work?video_array='+JSON.stringify(video_array)+'&index='+e.currentTarget.dataset.index,
    })
  },

})