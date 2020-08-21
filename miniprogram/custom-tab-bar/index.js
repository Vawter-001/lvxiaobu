
Component({
  data: {
    "selected":0,
    "backgroundColor": "#171824",
    "color": "#ffffff",
    "selectedColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "selectedIconPath": "/images/indexY.png",
        "iconPath": "/images/indexN.png",
        "pagePath": "/pages/index/index",
        "text": "首页"
      },
      {
        "selectedIconPath": "/images/blogY.png",
        "iconPath": "/images/blogN.png",
        "pagePath": "/pages/blog/blog",
        "text": "攻略"
      },
      {
        "selectedIconPath": "/images/messageY.png",
        "iconPath": "/images/messageN.png",
        "pagePath": "/pages/message/message",
        "text": "消息"
      },
      {
        "selectedIconPath": "/images/myY.png",
        "iconPath": "/images/myN.png",
        "pagePath": "/pages/my/my",
        "text": "我"
      }
    ]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      this.setData({
        selected:data.index
      })
      wx.switchTab({url})
    }
  }
})