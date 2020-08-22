// miniprogram/pages/edit_video/edit_video.js
const app=getApp()
var video;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editing:true,
    back:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    video=options.video
    console.log('video',video)
    this.open_editor()
  },
  open_editor(){
    var that=this;
    wx.openVideoEditor({
      filePath:video,
      fail:err=>{
        console.error('err',err)
      },
      complete:res=>{
        if(res.errCode==803){
          that.data.back=true
          wx.navigateBack()
        }
        else if(res.errCode==0){
          console.log("success")
          wx.navigateTo({
            url: '../post_video/post_video',
          })
        }
      }
    })
  },

  /*
  editing和back的逻辑：
  想实现：从视频录制页面进来时，会直接进行剪辑，剪辑完成后，会直接进入发布页面
  剪辑取消后，直接返回到视频录制页面
  从发布页面返回时，直接进入剪辑页面

  逻辑：
  首先是剪辑，剪辑取消时，只会执行complete方法，所以通过errcode来判断，剪辑是成功了，还是取消了
  
  然后是editing，从录制页面进入时，会先唤醒onLoad
  执行了onLoad后，调用剪辑页面会执行onHide
  如果剪辑完成，跳转时会再执行一次onHide
  从发布页面返回时，不会执行onLoad，而会执行onShow
  所以，在执行onHide时，给editing一个false，
  在onShow中，判断editing的值，如果为false，就唤醒剪辑页面
  所以从发布页面返回时，因为执行了onHide，所以还是会调用onShow，唤醒剪辑页面

  但存在一个bug
  如果剪辑取消，也会调用一次onShow，而在唤醒剪辑页面的时候
  就执行了onHide，所以此时editing还是false
  意味着，如果剪辑取消时，调用的onShow也会唤醒剪辑页面

  所以加了一个变量back
  在剪辑返回时，设定back为true
  在onShow中判断back的值，为true就不调用剪辑页面
  然后因为要返回到录制页面，所以会调用onhide
  在onHide中，给back设定为原始值false
  */ 
  onShow(){
    if(!this.data.editing&&!this.data.back){
      this.open_editor()
    }
  },

  onHide(){
    this.setData({editing:false,back:false})
  },

})