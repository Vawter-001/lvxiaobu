// components/record_video.js
const app=getApp()
const db=wx.cloud.database()
const _=db.command

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
    },
    nav:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height:String(app.globalData.total_height/app.globalData.ratio-160)+'rpx',
    work_type:'video',
  },

  
  attached(){
    var my=false;
    var ifollowed=false;
    var that=this;
    //判断是否是自己的
    if(app.globalData.openid===that.data.userInfo._id){
      my=true
    }

    //判断自己的关注列表中，是否有此人的id
    if(app.globalData.userInfo.followed.indexOf(that.data.userInfo._id)>=0){
      ifollowed=true
    }

    that.setData({my,ifollowed})

    setTimeout(() => {
      that.get_work()
    }, 500);
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取视频或博文
    get_work(){
      var that=this;
      console.log("get_work")
      //视频查询
      if(that.data.nav==0){
        console.log("get_video_work")
        wx.cloud.callFunction({
          name:'get_video',
          data:{followed:true,followed_list:[that.data.userInfo._id]}
        }).then(res=>{
          console.log('video_work_res',res.result.video_list)
          that.setData({
            video_works:res.result.video_list
          })
        }).catch(err=>{
          console.error('error',err)
        })
      }
      //博文查询
      else{
        wx.cloud.callFunction({
          name:'get_blogs',
          data:{followed:true,followed_list:[that.data.userInfo._id]}
        }).then(res=>{
          var reg = /\<(.+?)\>/g
          var reg_img=/\<img(.+?)\>/g
          var blogs=JSON.parse(JSON.stringify(res.result.blog_list))
          for(var i in blogs){
            //html替换
            blogs[i]['html']=blogs[i]['html'].replace(reg_img," [图片] ")
            blogs[i]['html']=blogs[i]['html'].replace(reg," ")
            //判断是否关注
            if(app.globalData.userInfo.followed.indexOf(blogs[i]['_openid'])>=0){
              blogs[i]['ifollowed']=true
              res.result.blog_list[i]['ifollowed']=true
            }else{
              blogs[i]['ifollowed']=false
              res.result.blog_list[i]['ifollowed']=false
            }
          }
          that.setData({
            blog_list:res.result.blog_list,
            blogs:blogs
          })
        }).catch(err=>{
          console.error('err',err)
        })
      }
    },

    //复制id
    copy(e){
      wx.setClipboardData({
        data:e.currentTarget.dataset.data
      })
    },

    //编辑个人简介
    to_edit_userInfo(){
      wx.navigateTo({
        url: '/pages/edit_userInfo/edit_userInfo',
      })
    },

    //获取聊天室id,进入聊天室
    enter_chat:function(e){
      wx.showLoading({title: '进入聊天'})
      var f_openid=e.currentTarget.dataset._id//对方的openid
      var f_nickName=e.currentTarget.dataset.nick_name//对方的昵称
      var f_avatarUrl=e.currentTarget.dataset.avatar_url
      //console.log("---",f_openid,f_nick_name)
      wx.cloud.callFunction({
        name: 'get_GroupId',
        data: {
          f_openid:f_openid,
          Myopenid:app.globalData.openid,
          members_data:{
            [f_openid]:{_openid:f_openid,nickName:f_nickName,avatarUrl:f_avatarUrl},
            [app.globalData.openid]:{_openid:app.globalData.openid,nickName:app.globalData.userInfo.nickName,avatarUrl:app.globalData.userInfo.avatarUrl}
          }
        },
        success: res => {
          console.log('[云函数] [get_GroupId] GroupId: ', res.result.GroupId)
          var GroupId=res.result.GroupId
          wx.navigateTo({
            url: '../chat_room/chat_room?GroupId='+GroupId+'&avatar_url='+app.globalData.userInfo.avatarUrl+'&userInfo='+JSON.stringify(app.globalData.userInfo)+'&f_nick_name='+f_nickName,
          })
          wx.hideLoading()
        },
        fail: err => {
          wx.hideLoading()
          console.error('[云函数] [get_GroupId] 调用失败', err)
        }
      })
    },

    //关注
    async follow(e){
      if(!app.globalData.openid){
        wx.switchTab({
          url: '../my/my',
        })
        return
      }

      var other_openid=this.data.userInfo._id
      var my_openid=app.globalData.openid

      //修改ifollowed
      this.setData({
        ifollowed:true
      })

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
        to_user_id:this.data.userInfo._id,
        status:'unread',
        send_user_nickName:app.globalData.userInfo.nickName,
        send_user_avatarUrl:app.globalData.userInfo.avatarUrl,
        send_user_id:app.globalData.openid
      }
      await app.add('inform',data3,false)
    },

    //取关
    async cancel_follow(e){
      if(!app.globalData.openid){
        wx.switchTab({
          url: '../my/my',
        })
        return
      }

      var other_openid=this.data.userInfo._id
      var my_openid=app.globalData.openid

      //修改ifollowed
      this.setData({
        ifollowed:false
      })

      //把我的openid，pull出对方的粉丝列表
      var data={
        fens:_.pull(my_openid)
      }
      await app.update('user',other_openid,data,false)

      //把对方的openid，pull出我的关注列表
      var data2={
        followed:_.pull(other_openid)
      }
      await app.update('user',my_openid,data2,false)
      let i=app.globalData.userInfo.followed.indexOf(other_openid)
      app.globalData.userInfo.followed.splice(i,1)
    },

    to_user_list(e){
      wx.navigateTo({
        url: '/pages/user_list/user_list?type='+e.currentTarget.dataset.type+'&user_list='+JSON.stringify(e.currentTarget.dataset.user_list),
      })
    },

    //改变导航栏
    change_nav(e){
      this.setData({
        nav:parseInt(e.currentTarget.dataset.index)
      })
      this.get_work()
    },
    swiper_nav(e){
      this.change_nav({'currentTarget':{'dataset':{'index':e.detail.current}}})
    },

    //删除视频
    async delete_item(e){
      var that=this;
      wx.showModal({
        title:'警告',
        content:'确定要删除此项吗？\n删除后无法复原',
        success:async res=>{
          if(res.confirm){
            wx.showLoading({
              title: '删除中',
            })
            await app.delete('video',e.currentTarget.dataset.id)
            that.get_work()
          }
        }
      })
    },
    
    //预览所有视频
    to_preview_work(e){
      var video_array=[]
      for(let i in this.data.video_works){
        video_array.push(this.data.video_works[i]['_id'])
      }
      wx.navigateTo({
        url: '/pages/preview_work/preview_work?video_array='+JSON.stringify(video_array)+'&index='+e.currentTarget.dataset.index,
      })
    },

    //预览博文
    to_blog_detail(e){
      wx.navigateTo({
        url: "../blog_detail/blog_detail?_id="+e.currentTarget.dataset._id+"&mode=normal",
      })
    },

  }
})
