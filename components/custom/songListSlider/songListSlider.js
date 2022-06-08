Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Object,
      value: []
    }
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
    /**
     * 跳转歌单
     */
    toSongSheetPage(event) {
      let id  = event.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/songSheetPage/songSheet?id=' + id,
      })
    },
  },
  options: {
    addGlobalClass: true
  }
})
