// miniprogram/pages/map/map.js
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
    var location=JSON.parse(options.location)
    var location_name=options.location_name
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userLocation']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          this.mapCtx = wx.createMapContext('myMap')
        }
        else{
          console.log("location_un_auth")
          wx.getLocation({
            success:res=>{
              this.mapCtx = wx.createMapContext('myMap')
            }
          })
        }
      }
    })
    this.setData({
      latitude:location[1],
      longitude:location[0],
      markers: [
        {
          id: 1,
          latitude: location[1],
          longitude: location[0],
          name:location_name,
          label:{content:location_name,color:'#FF0000'},
          callout:{content:location_name,color:'#FF0000',fontSize:15,borderRadius:5,padding:10}
        }
      ]
    })
  },

  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
})