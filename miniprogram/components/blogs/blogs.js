// components/blogs/blogs.js
const app=getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog_list:{
      type:Array,
      value:[]
    },
    no_data:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  observers: {
    'blog_list': function(blog_list) {
      var reg = /\<(.+?)\>/g
      var reg_img=/\<img(.+?)\>/g
      this.data.blogs=JSON.parse(JSON.stringify(blog_list))
      for(i in this.data.blogs){
        //修改提取出只有文字的html
        this.data.blogs[i]['html']=this.data.blogs[i]['html'].replace(reg_img," [图片] ")
        this.data.blogs[i]['html']=this.data.blogs[i]['html'].replace(reg," ")
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
      //app.globalData.blog=this.data.blog_list[e.currentTarget.dataset.index]
      wx.navigateTo({
        url: "../blog_detail/blog_detail?_id="+this.data.blog_list[e.currentTarget.dataset.index]._id+"&mode=normal",
      })
    }
  }
})
