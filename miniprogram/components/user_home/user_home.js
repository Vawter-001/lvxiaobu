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
      type:Object
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

    video_array:[]
  },
  
  attached(){
    var my=false;
    var ifollowed=false;
    //判断是否是自己的
    if(app.globalData.openid===this.data.userInfo._id){
      my=true
    }

    //判断自己的关注列表中，是否有此人的id
    if(app.globalData.userInfo.followed.indexOf(this.data.userInfo._id)>=0){
      ifollowed=true
    }

    this.setData({my,ifollowed})

    this.get_work()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取视频或博文
    async get_work(){
      var that=this;
      //视频查询
      if(that.data.nav==0){
        await wx.cloud.callFunction({
          name:'get_video',
          data:{followed:true,followed_list:[that.data.userInfo._id]}
        }).then(res=>{
          that.setData({
            video_works:res.result.video_list
          })
          for(i in res.result.video_list){
            that.data.video_array.push(res.result.video_list[i]._id)
          }
        }).catch(err=>{
          console.error('error',err)
        })
      }
      //博文查询
      if(that.data.nav==1){
        await wx.cloud.callFunction({
          name:'get_blogs',
          data:{followed:true,followed_list:[that.data.userInfo._id]}
        }).then(res=>{
          var reg = /\<(.+?)\>/g
          var blogs=JSON.parse(JSON.stringify(res.result.blog_list))
          for(var i in blogs){
            //html替换
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
        fens:_.push(my_openid)
      }
      await app.update('user',other_openid,data,false)

      //把对方的openid，push进我的关注列表
      var data2={
        followed:_.push(other_openid)
      }
      await app.update('user',my_openid,data2,false)
      app.globalData.userInfo.followed.push(other_openid)
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
      wx.navigateTo({
        url: '/pages/preview_work/preview_work?video_array='+JSON.stringify(this.data.video_array)+'&index='+e.currentTarget.dataset.index,
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
