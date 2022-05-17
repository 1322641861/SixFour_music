// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#d81e06",
    list: [{
      pagePath: "/pages/index/index",
      text: "发现",
      iconPath: "/static/images/tabbar/home.png",
      selectedIconPath: "/static/images/tabbar/home_active.png"
    }, {
      pagePath: "/pages/cloud/cloud",
      text: "云村",
      iconPath: "/static/images/tabbar/cloud.png",
      selectedIconPath: "/static/images/tabbar/cloud_active.png"
    }, {
      pagePath: "/pages/profile/profile",
      text: "我的",
      iconPath: "/static/images/tabbar/me.png",
      selectedIconPath: "/static/images/tabbar/me_active.png"
    }]
  },
  attached() {
  },
  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})
