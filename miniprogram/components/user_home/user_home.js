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
    work_type:'video'
  },
  
  attached(){
    console.log("nav",this.data.nav)
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
      //视频查询
      if(that.data.nav==0){
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
    
    to_preview_work(e){
      wx.navigateTo({
        url: '/pages/preview_work/preview_work?video_list='+JSON.stringify(this.data.video_works)+'&index='+e.currentTarget.dataset.index,
      })
    },

    change_nav(e){
      this.setData({
        nav:parseInt(e.currentTarget.dataset.index)
      })
      this.get_work()
    },
    swiper_nav(e){
      this.change_nav({'currentTarget':{'dataset':{'index':e.detail.current}}})
    },

    to_blog_detail(e){
      app.globalData.blog=this.data.blog_list[e.currentTarget.dataset.index]
      wx.navigateTo({
        url: '../blog_detail/blog_detail',
      })
    },

  }
})
