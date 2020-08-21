//index.js
const app = getApp()
var videoContext;
Page({
  data: {
    ratio:app.globalData.ratio,
    height:0,
    playing:true,
  },

  onLoad: function() {
    videoContext=wx.createVideoContext('my_video1')
  },

  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:0})
    }
  },

  init_video(e){
    var height=e.detail.height;
    var width=e.detail.width;
    if(height>width){
      height=true
    }
    else{
      height=false
    }
    this.setData({
      height:height
    })
    console.log('height',this.data.height)
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

})
