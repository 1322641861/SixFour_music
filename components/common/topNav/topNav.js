// components/common/topNav/topNav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowSlot: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: ""
    },
    titleColor: {
      type: String,
      value: "#fff"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack() {
      this.triggerEvent("customGoBack")
    },
    updateBarHeight(statusBarHeight) {
      this.setData({ statusBarHeight });
    }
  },
  lifetimes: {
    created: function () {
      try {
        let systemInfo = wx.getSystemInfoSync();
        this.updateBarHeight(systemInfo.statusBarHeight);
      } catch (error) {
        console.log(error);
      }
    },
    attached: function () {
    },
    ready: function () {
      this.updateBarHeight(this.data.statusBarHeight);
    }
  }
})
