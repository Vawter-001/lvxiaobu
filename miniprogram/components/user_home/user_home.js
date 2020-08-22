// components/record_video.js
const app=getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scroll:{
      type:Boolean
    },
    userInfo:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height:String(app.globalData.total_height/app.globalData.ratio-160)+'rpx',
    work_type:'video'
  },
  
  attached(){
    if(app.globalData.openid===this.data.userInfo._id){
      this.setData({my:true})
    }
    else{
      this.setData({my:false})
    }
    this.get_work()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    get_work(){

    },

    copy(e){
      wx.setClipboardData({
        data:e.currentTarget.dataset.data
      })
    },
  }
})
