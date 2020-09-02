// miniprogram/pages/edit_blog/edit_blog.js
const app=getApp()
const util=require('../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    labels:[
      {label:'美景',selected:false},
      {label:'美食',selected:false},
      {label:'人文',selected:false},
      {label:'冒险',selected:false},
      {label:'国外',selected:false},
      {label:'户外',selected:false},
      {label:'乡村',selected:false}
    ],
    height:app.globalData.total_height/app.globalData.ratio-370
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.edit_blog){
      var blog=app.globalData.edit_blog
      //console.log("blog",blog)
      var title=blog.title
      app.globalData.html=blog.html
      var labels=blog.labels
      for(i in this.data.labels){
        if(labels.indexOf(this.data.labels[i]['label'])>=0){
          this.data.labels[i]['selected']=true
        }
      }
      this.setData({
        mode:'edit',
        title,
        html:app.globalData.html,
        labels:this.data.labels,
        blog:blog
      })
    }
    else{
      this.setData({mode:'add'})
    }
  },

  get_title(e){
    this.setData({
      title:e.detail.value
    })
  },

  change_selected_labels(e){
    var labels=this.data.labels
    var index=e.currentTarget.dataset.index
    labels[index]['selected']=!labels[index]['selected']
    this.setData({
      labels
    })
  },

  to_blog_detail(){
    if(!this.data.title){
      wx.showToast({
        title: '请填写标题',
        icon:'none'
      })
      return
    }
    var lb=[]//获取lables
    for(i in this.data.labels){
      if(this.data.labels[i]['selected']){
        lb.push(this.data.labels[i]['label'])
      }
    }
    

    //构造blog数据
    var blog={
      title:this.data.title,
      user_nickName:app.globalData.userInfo.nickName,
      user_avatarUrl:app.globalData.userInfo.avatarUrl,
      html:app.globalData.html,
      labels:lb,
      create_time:util.order_date(new Date())
    }
    app.globalData.blog=blog
    wx.navigateTo({
      url: "../blog_detail/blog_detail?mode=preview",
    })
  },

  async post(){
    //判断是否有标题
    if(!this.data.title){
      wx.showToast({
        title: '请填写标题',
        icon:'none'
      })
      return
    }
    //提取标签
    var lb=[]
    for(i in this.data.labels){
      if(this.data.labels[i]['selected']){
        lb.push(this.data.labels[i]['label'])
      }
    }

    //使用正则表达式提取出所有图片的本地缓存地址
    var imgs=[]
    var imgReg = /<img.*?(?:>|\/>)/gi;
    var srcReg=/src=['"]?([^'"]*)['"]?/i;
    var arr=app.globalData.html.match(imgReg);
    if(arr)
      for (var i=0; i<arr.length;i++) {
        var src = arr[i].match(srcReg);
        imgs.push(src[1])
      }

    //上传图片
    var name='blog---'+app.globalData.openid+'---'+this.data.title.substr(0,10)
    var new_imgs=await app.upload_file(imgs,name)
    for(i in new_imgs){
      app.globalData.html=(app.globalData.html).replace(new RegExp(imgs[i],'g'),new_imgs[i])
    }

    //构造blog数据，并存入数据库
    var blog={
      title:this.data.title,
      user_nickName:app.globalData.userInfo.nickName,
      user_avatarUrl:app.globalData.userInfo.avatarUrl,
      html:app.globalData.html,
      labels:lb
    }

    //添加模式和编辑模式
    if(this.data.mode=='add'){
      blog['liked']=[]
      blog['comments_num']=0
      var res=JSON.parse(await app.add('blog',blog))
      if(res['errMsg']=='collection.add:ok'){
        wx.reLaunch({
          url: '../my/my?nav=1',
        })
      }
    }
    else if(this.data.mode=='edit'){
      var r=JSON.parse(await app.update('blog',this.data.blog._id,blog))
      if(r['errMsg']=='document.update:ok'){
        wx.reLaunch({
          url: '../my/my?nav=1',
        })
      }
    }
  },

  onHide(){
    app.globalData.edit_blog=null
  },

})