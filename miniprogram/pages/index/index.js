//index.js
const app = getApp()
var videoContext,videoContext2,videoContext3;
const db=wx.cloud.database()
const _=db.command
var video_time=0;
var spy_inform,spy_inform_message;
var init_index=0;//翻页到顶部或底部时，会用到

Page({
  data: {
    ratio:app.globalData.ratio,
    main_height:String(app.globalData.total_height/app.globalData.ratio-100)+'rpx',
    video_fit:'cover',
    s_nav:'推荐',
    playing:true,
    nav:0,
    danmu_list:[],
    danmu_index:0,
    show_send_danmu:false,
    colors:['#ffffff','#0000FF','#FF0000','#A020F0','#32CD32','#FFB90F','#000000'],
    selected_color:'#ffffff',
    show_hover:false,
    show_share:false,

    video_array:[],//视频推荐列表

    swiper_list:[],//页面滑块列表

  },

  //获取视频，初始化弹幕
  onLoad:function(options){
    var that=this;

    that.get_video()
    
    if(!app.globalData.openid){
      app.openidReadyCallback=res=>{
        that.spy()
        that.spy_message()
      }
    }
  },

  //监听用户点赞数据、评论数据以及粉丝数据的变化
  //并调用getTabBar()方法，渲染到底部导航栏
  spy(){
    var that=this;

    spy_inform=db.collection("inform").where({
      to_user_id:app.globalData.openid,
      status:'unread'
    }).watch({
      onChange: function(snapshot) {
        app.globalData.tabbar_data.inform=snapshot.docs
        that.getTabBar().setData({
          tabbar_data:app.globalData.tabbar_data
        })
      },
      onError: function(err) {
        console.error('the watch closed because of error',err)
      }
    })
  },
  //监听用户的未读消息数据
  spy_message(){
    var that=this;

    var where=_.and([
      _.or([
        {member1:app.globalData.openid},
        {member2:app.globalData.openid}
      ]),
      {_openid:_.neq(app.globalData.openid)},
      {status:'unread'}
    ])

    //因为chatroom里的数据是不包含成员id的
    //而恰好groupid是由成员id构成的
    //所以使用正则表达式获取对应的groupid
    //然后获取status为未读的记录
    spy_inform_message=db.collection("ChatRoom").where(where)
    .watch({
      onChange: function(snapshot) {
        console.log('snapshot_index',snapshot)
        app.globalData.tabbar_data.inform_message=snapshot.docs
        that.getTabBar().setData({
          tabbar_data:app.globalData.tabbar_data
        })
      },
      onError: function(err) {
        console.error('the watch closed because of error',err)
      }
    })
  },

  //底部导航
  onShow(){
    if(typeof this.getTabBar==='function' && this.getTabBar()){
      this.getTabBar().setData({selected:0})
    }

    //渲染消息通知
    this.getTabBar().setData({
      tabbar_data:app.globalData.tabbar_data
    })
    
    //如果有推荐列表就刷新推荐列表
    if(JSON.stringify(this.data.video_array)!="[]"){
      var that=this;
      wx.cloud.callFunction({
        name:'fresh',
        data:{type:'video',array:this.data.video_array}
      }).then(res=>{
        that.setData({
          video_list:res.result.list
        })
        that.update_swiper_list(that.data.nav)
        that.get_danmu()
      })
    }
  },

  to_search(){
    wx.navigateTo({
      url: '../search/search?nav=1',
    })
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
      nav:0
    })
    if(e.currentTarget.dataset.type=='推荐'){
      this.get_video()
    }
    else if(e.currentTarget.dataset.type=='关注'){
      this.get_video({followed:true,followed_list:app.globalData.userInfo.followed})
    }
  },

  //跳转到直播页面
  to_live(){
    wx.navigateTo({
      url: '../live/live',
    })
  },

  //获取视频
  async get_video(data={followed:false}){
    //followed为true时，获取关注用户数据，为false时，获取推荐数据
    var that=this;
    that.data.video_list=[]
    wx.showLoading({
      title: '获取中数据',
      mask:true
    })
    wx.cloud.callFunction({
      name:'get_video',
      data:data
    }).then(res=>{
      that.setData({
        video_list:res.result.video_list,
        nav:0,
      })
      //获取当前推荐视频的id，并存入列表中，用于在执行onshow时刷新
      for(let i in res.result.video_list){
        that.data.video_array.push(res.result.video_list[i]._id)
      }
      that.update_swiper_list(0)
      that.update_video_context(0)
      that.get_danmu()
      wx.showToast({
        title: '已为您推荐新的视频',
        icon:'none'
      })
    }).catch(err=>{
      wx.showToast({
        title: '获取数据失败',
        icon:'none'
      })
      console.error('error',err)
    })
  },

  //渲染swiper-list
  update_swiper_list(index){
    //清空swiper-list
    this.data.swiper_list=[]
    //循环video——list，并根据传递过来的index，生成新的swiper-list
    for(var i in this.data.video_list){
      this.data.swiper_list.push('')
      if( parseInt(i)+1==index || i==index || parseInt(i)-1==index ){
        this.data.swiper_list[i]=this.data.video_list[i]
      }
    }
    //渲染swiper-list
    this.setData({
      swiper_list:this.data.swiper_list
    })
  },

  //更新三个video对应的api接口
  update_video_context(index){
    videoContext = wx.createVideoContext('my_video'+String(index))
    videoContext2=wx.createVideoContext('my_video'+String(index-1))
    videoContext3=wx.createVideoContext('my_video'+String(index+1))
    this.change_play({'currentTarget':{'dataset':{'play':true}}})
  },

  //适应视频
  my_init_video(e){
    var index=e.currentTarget.id.split('_')[1].substr(5,2)
    if(e.detail.height>=e.detail.width){//竖版视频
      this.data.swiper_list[index]['video_fit']='cover'
      //cover是放大适应，但可能会造成丢失长或宽的边缘画面
      this.setData({
        swiper_list:this.data.swiper_list,
      })
    }
    else{//横版视频
      this.data.swiper_list[index]['video_fit']='contain'
      //横版视频是contain，保证最长的边能够显示，空白地方用黑色填充
      this.setData({
        swiper_list:this.data.swiper_list,
      })
    }
  },

  //获取弹幕列表
  async get_danmu(){
    var that=this;
    await wx.cloud.callFunction({
      name:'get_danmu',
      data:{id:that.data.video_list[that.data.nav]._id}
    }).then(res=>{
      if(!app.globalData.openid){
        that.setData({
          danmu_list:res.result.danmu_list
        })
      }
      else{
        //console.log("dddd",that.data.video_list,that.data.nav)
        if(app.globalData.userInfo.followed.indexOf(that.data.video_list[that.data.nav]._openid)<0){
          that.data.video_list[that.data.nav].ifollowed=false
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

  //播放和暂停
  video_play(){
    this.setData({playing:true})
  },
  video_pause(){
    this.setData({playing:false})
  },
  change_play(e){
    videoContext2.pause()
    videoContext3.pause()
    if(e.currentTarget.dataset.play){
      this.video_play()
      videoContext.play()
    }
    else{
      this.video_pause()
      videoContext.pause()
    }
  },

  //此处为弹幕设计，使用了视频的bindtimeupdate事件接口
  //每250ms调用一次此方法，以获取当前视频播放到哪个时间点了
  video_time_change(e){
    var currentTime=parseInt(e.detail.currentTime)
    if(currentTime!=video_time){
      video_time=currentTime
    }
  },
  //重播视频，就不会有弹幕了，所以要重新setData一次弹幕数据
  reload_danmu(){
    var that=this;
    that.setData({
      danmu_list:that.data.danmu_list
    })

    that.change_play({'currentTarget':{'dataset':{'play':true}}})
  },

  //关注
  async follow(e){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    var other_openid=this.data.video_list[this.data.nav]._openid
    var my_openid=app.globalData.openid

    //修改ifollowed
    this.data.video_list[this.data.nav].ifollowed=true
    this.setData({
      video_list:this.data.video_list
    })
    this.update_swiper_list(this.data.nav)

    //把我的openid，push进对方的粉丝列表
    var data={
      fens:_.addToSet(my_openid)
    }
    await app.update('user',other_openid,data,false)

    //把对方的openid，push进我的关注列表
    var data2={
      followed:_.addToSet(other_openid)
    }
    await app.update('user',my_openid,data2,false)
    app.globalData.userInfo.followed.push(other_openid)

    //通知被关注用户
    var data3={
      lcf_type:'fens',
      to_user_id:this.data.video_list[this.data.nav]._openid,
      status:'unread',
      send_user_nickName:app.globalData.userInfo.nickName,
      send_user_avatarUrl:app.globalData.userInfo.avatarUrl,
      send_user_id:app.globalData.openid
    }
    await app.add('inform',data3,false)
  },

  //喜欢视频，增加视频的喜欢列表，增加博主的喜欢量
  async like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    var id=this.data.video_list[this.data.nav]._id

    //把用户id，push进liked列表中
    var data={
      liked:_.addToSet(app.globalData.openid)
    }
    this.data.video_list[this.data.nav].liked.push(app.globalData.openid)
    this.data.video_list[this.data.nav].ilike=true
    this.setData({
      video_list:this.data.video_list
    })
    this.update_swiper_list(this.data.nav)
    await app.update('video',id,data,false) 
    
    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(1)
    }
    await app.update('user',this.data.video_list[this.data.nav]._openid,data2,false)

    //通知被点赞用户
    var data3={
      vb_type:'video',
      lcf_type:'like',
      to_user_id:this.data.video_list[this.data.nav]._openid,
      post_id:this.data.video_list[this.data.nav]._id,
      post_title:this.data.video_list[this.data.nav].title,
      status:'unread',
      send_user_nickName:app.globalData.userInfo.nickName,
      send_user_avatarUrl:app.globalData.userInfo.avatarUrl,
      send_user_id:app.globalData.openid
    }
    await app.add('inform',data3,false)
  },

  //取消喜欢
  async cancel_like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    var id=this.data.video_list[this.data.nav]._id
    //把用户id，push进liked列表中
    var data={
      liked:_.pull(app.globalData.openid)
    }
    
    var i=this.data.video_list[this.data.nav].liked.indexOf(app.globalData.openid)
    this.data.video_list[this.data.nav].liked.splice(i,1)
    this.data.video_list[this.data.nav].ilike=false
    this.setData({
      video_list:this.data.video_list
    })
    this.update_swiper_list(this.data.nav)
    await app.update('video',id,data,false) 

    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(-1)
    }
    await app.update('user',this.data.video_list[this.data.nav]._openid,data2,false)
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

    //弹幕发送时间
    var vt=parseInt(video_time)
    
    //改变本地的弹幕列表
    this.data.danmu_list.push({
      text:this.data.danmu_content,
      color:this.data.selected_color,
      time:vt+1
    })
    this.setData({
      danmu_list:this.data.danmu_list
    })

    //弹幕数据写入数据库
    var data={
      color:this.data.selected_color,
      text:this.data.danmu_content,
      video_id:this.data.video_list[this.data.nav]._id,
      time:vt
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
    await app.update('video',this.data.video_list[this.data.nav]._id,data2,false)

    //更新本地弹幕数量
    this.data.video_list[this.data.nav]['danmu_num']+=1
    this.setData({
      video_list:this.data.video_list
    })
    this.update_swiper_list(this.data.nav)

    //通知被评论用户
    var data3={
      vb_type:'video',
      lcf_type:'comments',
      to_user_id:this.data.video_list[this.data.nav]._openid,
      post_id:this.data.video_list[this.data.nav]._id,
      post_title:this.data.video_list[this.data.nav].title,
      text:data.text,
      status:'unread',
      send_user_nickName:app.globalData.userInfo.nickName,
      send_user_avatarUrl:app.globalData.userInfo.avatarUrl,
      send_user_id:app.globalData.openid
    }
    await app.add('inform',data3,false)
  },

  //滑块改变时，之前一个视频/下一个视频
  async next_pre_video(e){
    this.setData({playing:true})
    var index=e.detail.current
    this.setData({
      nav:index,
      danmu_list:[]
    })

    this.update_swiper_list(index)
    this.update_video_context(index)

    await this.get_danmu()
  },
  //获取用户滑动的方向和幅度
  get_direction(e){
    //console.log("direction",e)
    if(e.detail.dy/app.globalData.ratio<-150){
      this.setData({direction:'down'})
    }
    else if(e.detail.dy/app.globalData.ratio>150){
      this.setData({direction:'up'})
    }
  },
  //根据用户滑动的方向和幅度，来判断是否获取新视频列表
  async new_video_list(e){
    //init_index是上一个页面的current
    //如果是首页，且如果滑动方向是向下
    //如果是尾页，且如果滑动方向是向上
    if( (e.detail.current==init_index && e.detail.current==0 && //如果是首页
        this.data.direction=='down' ) || (e.detail.current==init_index && 
        e.detail.current==(this.data.video_list).length-1 && this.data.direction=='up') )
    {
      console.log('new_video_list')
      if(this.data.s_nav=='关注')
        await this.get_video({followed:true,followed_list:app.globalData.userInfo.followed})
      else
        await this.get_video()
    }
    init_index=e.detail.current
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
      url: '../others_home_page/others_home_page?id='+this.data.video_list[this.data.nav]._openid,
    })
  },

  //发送给好友
  onShareAppMessage: function () {
    this.setData({
      show_hover:false,
      show_share:false
    })
    return {
      title: '好友'+app.globalData.userInfo.nickName+'给你分享了视频',
      path: '/pages/preview_work/preview_work?video_array='+JSON.stringify([this.data.video_list[this.data.nav]._id])+'&index=0'
    }
  },

  // onShareTimeline: function () {
  //   console.log("tttlll",JSON.stringify([this.data.video_list[this.data.nav]._id]))
  //   return {
  //     title: '好友'+app.globalData.userInfo.nickName+'给你分享了视频',
  //     query: {
  //       video_array:JSON.stringify([this.data.video_list[this.data.nav]._id])
  //     }
  //   }
  // },

  show_share_tips(){
    this.setData({
      show_hover:false,
      show_share:false
    })
    wx.showModal({
      title:'提示',
      content:'首页暂时无法分享到朋友圈\n请点击头像进入用户主页分享'
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
