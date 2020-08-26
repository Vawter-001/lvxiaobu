// components/blogs/blogs.js
const util=require('../../util.js')
const app=getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog_list:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    blogs:[]
  },

  observers: {
    'blog_list': function(blog_list) {
      var reg = /\<(.+?)\>/g
      this.data.blogs=JSON.parse(JSON.stringify(blog_list))
      for(i in this.data.blogs){
        //修改时间样式
        this.data.blogs[i]['create_time']=util.order_date(new Date(this.data.blogs[i]['create_time']))
        this.data.blog_list[i]['create_time']=this.data.blogs[i]['create_time']
        //修改提取出只有文字的html
        this.data.blogs[i]['html']=this.data.blogs[i]['html'].replace(reg," ")
        //判断是否关注
        if(app.globalData.userInfo.followed.indexOf(this.data.blogs[i]['_openid'])>=0){
          this.data.blogs[i]['ifollowed']=true
          this.data.blog_list[i]['ifollowed']=true
        }else{
          this.data.blogs[i]['ifollowed']=false
          this.data.blog_list[i]['ifollowed']=false
        }
      }
      this.setData({
        blogs:this.data.blogs
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    to_blog_detail(e){
      app.globalData.blog=this.data.blog_list[e.currentTarget.dataset.index]
      wx.navigateTo({
        url: '../blog_detail/blog_detail',
      })
    }
  }
})
