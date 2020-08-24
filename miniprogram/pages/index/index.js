//index.js
const app = getApp()
var videoContext;
const db=wx.cloud.database()
const _=db.command
var video_time=0;

Page({
  data: {
    ratio:app.globalData.ratio,
    height:0,
    s_nav:'推荐',
    playing:true,
    index:0,
    danmu_list:[],
    danmu_index:0,
    show_send_danmu:false,
    colors:['#ffffff','#0000FF','#FF0000','#A020F0','#32CD32','#FFB90F','#000000'],
    selected_color:'#ffffff',
    show_hover:false,
    show_share:false,
  },

  //获取视频，初始化弹幕
  onLoad: function() {
    videoContext=wx.createVideoContext('my_video1')
    this.addBarrage()
    this.get_video()
  },

  //底部导航
  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:0})
    }
  },

  change_nav(e){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    this.setData({
      s_nav:e.currentTarget.dataset.type,
      index:0
    })
    if(e.currentTarget.dataset.type=='推荐'){
      this.get_video()
    }
    else if(e.currentTarget.dataset.type=='关注'){
      this.get_video({followed:true,followed_list:app.globalData.userInfo.followed})
    }
  },

  //获取视频
  async get_video(data={followed:false}){
    //followed为true时，获取关注用户数据，为false时，获取推荐数据
    var that=this;
    await wx.cloud.callFunction({
      name:'get_video',
      data:data
    }).then(res=>{
      //console.log("userInfo",app.globalData.userInfo)
      that.setData({
        video_list:res.result.video_list
      })
      that.get_danmu()
    }).catch(err=>{
      console.error('error',err)
    })
  },

  //获取的弹幕列表为：['3.1':[{弹幕一},{弹幕二}],'3.2':[{弹幕三},{弹幕四}],'3.5':[{弹幕五}]]
  async get_danmu(){
    var that=this;
    await wx.cloud.callFunction({
      name:'get_danmu',
      data:{id:that.data.video_list[that.data.index]._id}
    }).then(res=>{
      if(!app.globalData.openid){
        that.setData({
          danmu_list:res.result.danmu_list
        })
      }
      else{
        if(app.globalData.userInfo.followed.indexOf(that.data.video_list[that.data.index]._openid)<0){
          that.data.video_list[that.data.index].ifollowed=false
        }
        that.setData({
          video_list:that.data.video_list,
          danmu_list:res.result.danmu_list
        })
      }

    }).catch(err=>{
      console.error("err",err)
    })
  },

  //初始化弹幕
  async addBarrage() {
    const barrageComp = this.selectComponent('.barrage')//获取组件实例
    this.barrage =await barrageComp.getBarrageInstance({//初始化组件
      font: 'bold 16px sans-serif',
      duration: 10,
      lineHeight: 2,
      mode: 'separate',
      padding: [10, 0, 10, 0],
      tunnelShow: false
    })
    await this.barrage.open()
    await this.barrage.setRange([0,0.3])
  },

  //播放和暂停
  change_play(e){
    if(e.currentTarget.dataset.play){
      this.setData({playing:true})
      videoContext.play()
    }
    else{
      this.setData({playing:false})
      videoContext.pause()
    }
  },

  //此处为弹幕设计，使用了视频的bindtimeupdate事件接口
  //每250ms调用一次此方法，配合弹幕列表的数据格式，
  //就可以按照视频的播放节点发送弹幕
  video_time_change(e){
    var currentTime=parseInt(e.detail.currentTime)
    if(currentTime!=video_time){
      video_time=currentTime
      if(this.data.danmu_list[video_time])
        this.barrage.addData(this.data.danmu_list[video_time])
    }
  },
  async clear_danmu(){
    var that=this;
    await that.barrage.close()
    setTimeout(async () => {
      video_time=0
      await that.addBarrage()
      await videoContext.seek(0)
      await videoContext.play()
    }, 800);

  },

  //关注
  async follow(e){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    var other_openid=this.data.video_list[this.data.index]._openid
    var my_openid=app.globalData.openid

    //修改ifollowed
    this.data.video_list[this.data.index].ifollowed=true
    this.setData({
      video_list:this.data.video_list
    })

    //把我的openid，push进对方的粉丝列表
    var data={
      fens:_.push(my_openid)
    }
    await app.update('user',other_openid,data,false)

    //把对方的openid，push进我的关注列表
    var data2={
      followed:_.push(other_openid)
    }
    await app.update('user',my_openid,data2,false)

  },

  //喜欢视频，增加视频的喜欢列表，增加博主的喜欢量
  async like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    var id=this.data.video_list[this.data.index]._id
    //把用户id，push进liked列表中
    var data={
      liked:_.push(app.globalData.openid)
    }
    this.data.video_list[this.data.index].liked.push(app.globalData.openid)
    this.data.video_list[this.data.index].ilike=true
    this.setData({
      video_list:this.data.video_list
    })
    await app.update('video',id,data,false) 
    
    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(1)
    }
    await app.update('user',this.data.video_list[this.data.index]._openid,data2,false)
  },

  //取消喜欢
  async cancel_like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    var id=this.data.video_list[this.data.index]._id
    //把用户id，push进liked列表中
    var data={
      liked:_.pull(app.globalData.openid)
    }
    
    var i=this.data.video_list[this.data.index].liked.indexOf(app.globalData.openid)
    this.data.video_list[this.data.index].liked.splice(i,1)
    this.data.video_list[this.data.index].ilike=false
    this.setData({
      video_list:this.data.video_list
    })
    await app.update('video',id,data,false) 

    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(-1)
    }
    await app.update('user',this.data.video_list[this.data.index]._openid,data2,false)
  },

  // 改变蒙层的展示
  change_show_hover(){
    this.setData({
      show_hover:!this.data.show_hover
    })
  },

  //展示发弹幕弹窗
  show_send_danmu_view(){
    this.setData({
      show_send_danmu:!this.data.show_send_danmu
    })
    this.change_show_hover()
  },

  //展示分享弹窗
  change_show_share(){
    this.setData({
      show_share:!this.data.show_share
    })
    this.change_show_hover()
  },

  //改变弹幕颜色
  change_danmu_color(e){
    this.setData({
      selected_color:e.currentTarget.dataset.color
    })
  },

  //获取弹幕输入框
  get_danmu_content(e){
    this.setData({
      danmu_content:e.detail.value
    })
  },

  //发弹幕，添加到下一秒的时间点
  //添加数据到数据库
  //成功后，清除弹幕输入框，并隐藏弹幕弹出框
  async send(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    var vt=parseInt(video_time)+1
    
    //改变本地的弹幕列表
    if(this.data.danmu_list[vt]){
      this.data.danmu_list[vt].push({
        content:this.data.danmu_content,
        color:this.data.selected_color
      })
    }
    else{
      this.data.danmu_list[vt]=[{
        content:this.data.danmu_content,
        color:this.data.selected_color
      }]
    }

    //弹幕数据写入数据库
    var data={
      color:this.data.selected_color,
      content:this.data.danmu_content,
      video_id:this.data.video_list[this.data.index]._id,
      video_time:vt
    }
    var res=await app.add('danmu',data)
    res=JSON.parse(res)
    if(res['errMsg']=='collection.add:ok'){
      this.setData({
        danmu_content:'',
      })
      this.show_send_danmu_view()
    }

    //更新数据库弹幕数量
    var data2={
      danmu_num:_.inc(1)
    }
    await app.update('video',this.data.video_list[this.data.index]._id,data2,false)

    //更新本地弹幕数量
    this.data.video_list[this.data.index]['danmu_num']+=1
    this.setData({
      video_list:this.data.video_list
    })
  },

  //之前一个视频/下一个视频
  async next_pre_video(e){
    this.setData({playing:true})
    var index=this.data.index+e.derta
    this.barrage.close()
    if(index===(this.data.video_list).length || index===-1){
      this.setData({
        index:0,
        danmu_list:[]
      })
      await this.get_video()
      return
    }
    else{
      this.setData({
        index:this.data.index+e.derta,
        danmu_list:[]
      })
      await this.get_danmu()
    }
    this.addBarrage()
  },

  //查看地点
  to_map(e){
    wx.navigateTo({
      url: '../map/map?location='+JSON.stringify(e.currentTarget.dataset.location)+'&location_name='+e.currentTarget.dataset.location_name,
    })
  },

  //浏览用户主页
  to_others_home_page(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    wx.navigateTo({
      url: '../others_home_page/others_home_page?id='+this.data.video_list[this.data.index]._openid,
    })
  },

  //发视频
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

  //发送给好友
  onShareAppMessage: function () {
    this.setData({
      show_hover:false,
      show_share:false
    })
    return {
      title: '好友'+app.globalData.userInfo.nickName+'给你分享了视频',
      path: '/pages/index/index'
    }
  },

  onShareTimeline: function () {
    return {
      path: '/pages/index/index'
    }
  },

  show_share_tips(){
    this.setData({
      show_hover:false,
      show_share:false
    })
    wx.showModal({
      title:'提示',
      content:'点击右上角三个点\n选择分享到朋友圈即可～'
    })
  },
})
