// miniprogram/pages/post_video/post_video.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    auth:[0,0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options){},

  onShow() {
    this.get_camera_auth()
    this.get_record_auth()
  },

  get_camera_auth(){
    var that=this;
    wx.getSetting().then(res=>{
      //获取摄像机授权
      if(res.authSetting['scope.camera']){//已授权
        app.globalData.auth[0]=1
        that.setData({auth:app.globalData.auth})
      }
      else{//未授权，申请授权
        wx.authorize({
          scope: 'scope.camera',
        }).then(res=>{//授权成功
          app.globalData.auth[0]=1
          that.setData({auth:app.globalData.auth})
        }).catch(err=>{//授权失败
          app.cancel_auth('未授权摄像机无法发布视频','../index/index',(res=>{
            that.setData({auth:app.globalData.auth})
          }))
        })
      }
    })
  },

  get_record_auth(){
    var that=this;
    wx.getSetting().then(res=>{
      //获取录音授权
      if(res.authSetting['scope.record']){//已授权
        app.globalData.auth[1]=1
        that.setData({auth:app.globalData.auth})
      }
      else{//未授权，申请授权
        wx.authorize({
          scope: 'scope.record',
        }).then(res=>{//授权成功
          app.globalData.auth[1]=1
          that.setData({auth:app.globalData.auth})
        }).catch(err=>{//授权失败
          app.cancel_auth('未授权录音无法发布视频','../index/index',(res=>{
            that.setData({auth:app.globalData.auth})
          }))
        })
      }

    })
  }

})