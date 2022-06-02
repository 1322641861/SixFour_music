const appInstance = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musicInfo: {type: Object, value: {}},
    imageUrl: {type: String, value: ''},
    musicName: {type: String, value: ''},
    arName: {type: String, value: ''},
    alName: {type: String, value: ''},
    currentSongId: {type: Number, value: 0}
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
    musicPlay() {
      this.triggerEvent("musicPlay");
    },
    mvPlay() {
      this.triggerEvent("mvPlay");
    },
  },
  observers: {
    "currentSongId": function (currentSongId) {
      console.log('observers', currentSongId, appInstance.globalData.musicId);
      if (this.data.currentSongId !== currentSongId) this.setData({currentSongId});
    }
  },
  lifetimes: {
    created: function () {
    },
    attached: function () {
    },
    ready: function () {
    }
  },
  options: {
    styleIsolation: 'isolated'
  }
})
