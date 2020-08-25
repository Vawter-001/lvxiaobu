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
      type:Object
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
    async get_work(){
      var that=this;
      await wx.cloud.callFunction({
        name:'get_video',
        data:{followed:true,followed_list:[that.data.userInfo._id]}
      }).then(res=>{
        that.setData({
          video_works:res.result.video_list
        })
      }).catch(err=>{
        console.error('error',err)
      })
    },

    copy(e){
      wx.setClipboardData({
        data:e.currentTarget.dataset.data
      })
    },

    to_edit_userInfo(){
      wx.navigateTo({
        url: '/pages/edit_userInfo/edit_userInfo',
      })
    },
    
    to_preview_work(e){
      wx.navigateTo({
        url: '/pages/preview_work/preview_work?video_list='+JSON.stringify(this.data.video_works)+'&index='+e.currentTarget.dataset.index,
      })
    },
  }
})
