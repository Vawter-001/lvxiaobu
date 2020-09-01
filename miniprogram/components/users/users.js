// components/users/users.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    users:Object,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    to_others_home_page(e){
      wx.navigateTo({
        url: '../others_home_page/others_home_page?id='+e.currentTarget.dataset.id,
      })
    },
  }
})
