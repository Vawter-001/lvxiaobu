//index.js
const app = getApp()
var videoContext;

Page({
  data: {
    ratio:app.globalData.ratio,
    height:0,
    playing:true,
    index:0,
  },

  onLoad: function() {
    videoContext=wx.createVideoContext('my_video1')
    this.get_video()
  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:0})
    }
  },

  async get_video(){
    var that=this;
    await wx.cloud.callFunction({
      name:'get_video'
    }).then(res=>{
      that.setData({
        video_list:res.result.video_list
      })
    }).catch(err=>{
      console.error('error',err)
    })
  },

  change_play(e){
    if(e.currentTarget.dataset.play){
      videoContext.play()
      this.setData({playing:true})
    }
    else{
      videoContext.pause()
      this.setData({playing:false})
    }
  },

  async next_pre_video(e){
    this.setData({playing:true})
    var index=this.data.index+e.derta
    if(index===(this.data.video_list).length || index===-1){
      this.setData({
        index:0
      })
      await this.get_video()
      return
    }
    else{
      this.setData({
        index:this.data.index+e.derta
      })
    }
    
  },

  to_get_video(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
    }
    else{
      wx.navigateTo({
        url: '../get_video/get_video',
      })
    }
  },

})
