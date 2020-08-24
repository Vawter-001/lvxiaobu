// components/record_video.js
const app=getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    total_width:String(app.globalData.total_width/app.globalData.ratio)+'rpx',
    total_height:String(app.globalData.total_height/app.globalData.ratio)+'rpx',
    font_back:'front',
    recording:false
  },
  
  attached(){
    this.ctx = wx.createCameraContext()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    change_camera:function(){
      if (this.data.font_back=='front'){
        this.setData({ font_back:'back'})
      }
      else if (this.data.font_back == 'back') {
        this.setData({ font_back: 'front' })
      }
    },

    change_record(){
      var that=this;
      if(!that.data.recording){
        that.start_timer(30)
        that.setData({recording:true})
        that.ctx.startRecord({
          timeoutCallback:res=>{
            that.setData({
              recording:false,
              video:res.tempVideoPath
            })
            that.open_editor()
          }
        })        
      }
      else{
        wx.showLoading({title:'处理中'})
        that.setData({recording:false})
        that.ctx.stopRecord({
          //compressed:true,
          success:res=> {
            wx.hideLoading()
            that.setData({
              video:res.tempVideoPath
            })
            that.open_editor()
          },
        })
      }
    },

    start_timer(from){
      var that=this;
      var timer=from;
      that.data.setInter=setInterval(() => {
        timer=timer-1
        that.setData({timer})
        if(timer==1 || !that.data.recording){
          timer=30
          clearInterval(that.data.setInter)
        }
      }, 1000);
    },

    choose_video(){
      var that=this;
      wx.chooseVideo({
        sourceType: ['album'],
        compressed:false,
        success:res=>{
          that.setData({
            video:res.tempFilePath
          })
          that.open_editor()
        }
      })
    },

    open_editor(){
      var that=this;
      wx.openVideoEditor({
        filePath:that.data.video,
        fail:err=>{
          console.error('err',err)
        },
        success:res=>{
          wx.navigateTo({
            url: '../post_video/post_video?video='+res.tempFilePath,
          })
        }
      })
    },

  }
})
