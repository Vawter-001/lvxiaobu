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
    playing:true,
    index:0,
    danmu_list:[],
    danmu_index:0,
    show_send_danmu:false,
    colors:['#ffffff','#0000FF','#FF0000','#A020F0','#32CD32','#FFB90F','#000000'],
    selected_color:'#ffffff',
  },

  //获取视频，初始化弹幕
  onLoad: function() {
    videoContext=wx.createVideoContext('my_video1')
    this.get_video()
    this.addBarrage()
  },

  //底部导航
  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:0})
    }
  },

  //获取视频
  async get_video(){
    var that=this;
    await wx.cloud.callFunction({
      name:'get_video'
    }).then(res=>{
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
      that.setData({
        danmu_list:res.result.danmu_list
      })
    }).catch(err=>{
      console.error("err",err)
    })
  },

  //初始化弹幕
  addBarrage() {
    const barrageComp = this.selectComponent('.barrage')//获取组件实例
    this.barrage = barrageComp.getBarrageInstance({//初始化组件
      font: 'bold 16px sans-serif',
      duration: 10,
      lineHeight: 2,
      mode: 'separate',
      padding: [10, 0, 10, 0],
      tunnelShow: false
    })
    this.barrage.open()
    this.barrage.setRange([0,0.3])
  },

  //播放和暂停
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

  //此处为弹幕设计，使用了视频的bindtimeupdate事件接口
  //每250ms调用一次此方法，配合弹幕列表的数据格式，
  //就可以按照视频的播放节点发送弹幕
  get_time(e){
    var current_time=(e.detail.currentTime).toFixed(0)
    if(current_time!=video_time){
      video_time=current_time
      if(video_time==0){
        this.barrage.close()
      }
      else if(video_time==1){
        this.barrage.open()
        this.barrage.addData(this.data.danmu_list[video_time])
      }
      else{
        this.barrage.addData(this.data.danmu_list[video_time])
      }
    }
  },

  //喜欢视频，增加视频的喜欢列表，增加博主的喜欢量
  async like(){
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

  //展示弹幕列表
  show_send_danmu_view(){
    this.setData({
      show_send_danmu:!this.data.show_send_danmu
    })
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
    var vt=video_time

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

    var data={
      color:this.data.selected_color,
      content:this.data.danmu_content,
      video_id:this.data.video_list[this.data.index]._id,
      video_time:vt+1
    }
    var res=await app.add('danmu',data)
    res=JSON.parse(res)
    if(res['errMsg']=='collection.add:ok'){
      this.setData({
        danmu_content:'',
      })
      this.show_send_danmu_view()
    }
  },

  //之前一个视频/下一个视频
  async next_pre_video(e){
    this.setData({playing:true})
    var index=this.data.index+e.derta
    this.barrage.close()
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
    this.addBarrage()
  },

  //浏览用户主页
  to_others_home_page(){
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
})
