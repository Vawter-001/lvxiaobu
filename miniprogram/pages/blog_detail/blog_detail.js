// miniprogram/pages/blog_detail/blog_detail.js
const app=getApp()
const db=wx.cloud.database()
const _=db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    height:app.globalData.total_height/app.globalData.ratio-360,
    show_hover:false,
    show_share:false,
    show_comments:false,
    rank:1,
    comment_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    var iliked=false;
    var ifollowed=false;
    var mode=options.mode;
    console.log("mod",mode)
    var that=this;
    if(mode=='preview')
      that.setData({
        blog:app.globalData.blog,
        mode
      })
    else if(mode=='normal'){
      await wx.cloud.callFunction({
        name:'get_blogs',
        data:{followed:false,where:{_id:options._id}}
      }).then(res=>{
        var blog=res.result.blog_list[0]
        if(app.globalData.openid){
          //判断是否点赞
          if(blog.liked.indexOf(app.globalData.openid)>=0){
            iliked=true
          }
          //判断是否关注
          if(app.globalData.userInfo.followed.indexOf(blog._openid)>=0){
            ifollowed=true
          }
        }
        that.setData({
          blog:blog,
          to_user_id:blog._openid,
          to_user_nickName:blog.user_nickName,
          to_user_avatarUrl:blog.user_avatarUrl,
          id:app.globalData.openid,
          rank:1,
          comment_id:'',
          iliked,ifollowed,mode
        })
      }).catch(err=>{
        console.error("err",err)
      })
    }
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
      url: '../others_home_page/others_home_page?id='+this.data.blog._openid+'&nav=1',
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

    var other_openid=this.data.blog._openid
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

  //删除
  delete_blog(){
    var that=this;
    wx.showModal({
      title:'提醒',
      content:'确定要删除此攻略吗？\n删除后无法撤销！',
      success:async res=>{
        if(res.confirm){
          await app.delete('blog',that.data.blog._id)
          setTimeout(() => {
            wx.navigateBack()
          },2000);
        }
      }
    })
  },

  //编辑
  to_edit_blog(){
    app.globalData.edit_blog=this.data.blog
    wx.navigateTo({
      url: '../edit_blog/edit_blog',
    })
  },

  //喜欢视频，增加视频的喜欢列表，增加博主的喜欢量
  async like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }
    //把用户id，push进liked列表中
    var data={
      liked:_.push(app.globalData.openid)
    }
    this.data.blog.liked.push(app.globalData.openid)
    this.setData({
      iliked:true,
      blog:this.data.blog
    })
    await app.update('blog',this.data.blog._id,data,false) 
    
    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(1)
    }
    await app.update('user',this.data.blog._openid,data2,false)
  },

  //取消喜欢
  async cancel_like(){
    if(!app.globalData.openid){
      wx.switchTab({
        url: '../my/my',
      })
      return
    }

    //把用户id，push进liked列表中
    var data={
      liked:_.pull(app.globalData.openid)
    }
    var i=this.data.blog.liked.indexOf(app.globalData.openid)
    this.data.blog.liked.splice(i,1)
    this.setData({
      iliked:false,
      blog:this.data.blog
    })
    await app.update('blog',this.data.blog._id,data,false) 

    //给被点赞用户的点赞量加1
    var data2={
      liked_num:_.inc(-1)
    }
    await app.update('user',this.data.blog._openid,data2,false)
  },

  // 改变蒙层的展示
  change_show_hover(){
    this.setData({
      show_hover:!this.data.show_hover
    })
  },
  hide_all(){
    this.setData({
      show_hover:false,
      show_share:false,
      show_comments:false
    })
  },

  //展示分享弹窗
  change_show_share(){
    this.setData({
      show_share:!this.data.show_share
    })
    this.change_show_hover()
  },

  //改变评论框展示
  change_show_comments(){
    this.setData({
      show_comments:true,
      show_hover:true,
      to_user_id:this.data.blog._openid,
      to_user_nickName:this.data.blog.user_nickName,
      to_user_avatarUrl:this.data.blog.user_avatarUrl,
      comment_id:'',
      rank:1,

      my_comment:''
    })
    this.get_comments()
  },
  //展示评论区的时候查询评论
  get_comments(){
    wx.cloud.callFunction({
     name:'get_comments',
     data:{id:this.data.blog._id}
    }).then(res=>{
      this.setData({
        comment_list:res.result.comment_list
      })
    }).catch(err=>[
      console.error(err)
    ]) 
  },

  //用户点击用户留言时，设置为回复模式
  change_comment(e){
    var comment=e.currentTarget.dataset.comment
    console.log("ccc",comment,"eee",e)
    this.setData({
      to_user_id:comment.send_user_id,
      to_user_nickName:comment.send_user_nickName,
      to_user_avatarUrl:comment.send_user_avatarUrl,
      comment_id:comment.comment_id==""?comment._id:comment.comment_id,
      rank:2
    })
  },

  //获取评论框内容
  get_comment_input(e){
    this.setData({
      my_comment:e.detail.value
    })
  },

  //发送评论，二级评论和一级评论都以此model
  async send(){
    var comment={
      send_user_id:app.globalData.openid,
      send_user_nickName:app.globalData.userInfo.nickName,
      send_user_avatarUrl:app.globalData.userInfo.avatarUrl,
      text:this.data.my_comment,
      to_user_id:this.data.to_user_id,
      to_user_nickName:this.data.to_user_nickName,
      to_user_avatarUrl:this.data.to_user_avatarUrl,
      rank:this.data.rank,
      blog_id:this.data.blog._id,
      comment_id:this.data.comment_id
    }
    await app.add('comments',comment)
    this.change_show_comments()

    var data={
      'comments_num':_.inc(1)
    }
    await app.update('blog',this.data.blog._id,data,false)
    this.data.blog.comments_num+=1
    this.setData({
      blog:this.data.blog
    })
  },

  //发送给好友
  onShareAppMessage: function () {
    this.setData({
      show_hover:false,
      show_share:false
    })
    return {
      title: '好友'+app.globalData.userInfo.nickName+'给你分享了旅行攻略',
      path: '/pages/blog_detail/blog_detail?_id='+this.data.blog._id+'&mode=normal'
    }
  },

  onShareTimeline: function () {
    return {
      title: '好友'+app.globalData.userInfo.nickName+'给你分享了旅行攻略',
      path: '/pages/blog_detail/blog_detail?_id='+this.data.blog._id+'&mode=normal'
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