// components/custom/songSheetComponent/songSheetComponent.js
import {changeAudioPlayType} from "../../../utils/util";
import Pubsub from "pubsub-js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showMusicContainer: {
      type: Boolean,
      value: false
    },
    musicId: {
      type: Number,
      value: 0
    },
    bottomHeight: {
      type: String,
      value: '0'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentSongSheet: [],
    audioPlayType: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 切换随机播放..
     */
    changeAudioPlayType() {
      changeAudioPlayType(this);
    },
    
    /**
     * 获取当前播放歌单
     */
    getCurrentSongSheet() {
      let currentSongSheet = wx.getStorageSync('currentSongSheet');
      this.setData({currentSongSheet});
    },
    
    /**
     * 移除当前播放列表中的某个歌曲
     */
    deleteCurrentSong(event) {
      let {currentSongSheet} = this.data;
      let {musicid, index} = event.currentTarget.dataset;
      currentSongSheet.splice(index, 1);
      this.setData({currentSongSheet});
      wx.setStorageSync('currentSongSheet', currentSongSheet);
    },
    
    /// 列表弹窗中点击进入播放列表
    changeToWholeMusic(event) {
      console.log('列表弹窗中点击进入播放列表', event);
      let musicId = event.currentTarget.dataset.musicid;
      if (this.data.musicId !== musicId) {
        this.changeShowMusicContainer();
        wx.navigateTo({
          url: '/pages2/pages/songDetail/songDetail?musicId=' + musicId,
        })
      }
    },

    changeShowMusicContainer() {
      this.triggerEvent("changeShowMusic")
    },

    pubsubSheetList() {
      Pubsub.subscribe("changeSheetSong", (msg, data) => {
        console.log('pubsubSheetList', msg, data);
        if (data && data.length) {
          this.setData({currentSongSheet: data});
          Pubsub.unsubscribe("changeSheetSong");
        }
      })
    },
  },
  lifetimes: {
    created: function () {
      this.pubsubSheetList();
    },
    attached: function () {
      this.getCurrentSongSheet();
      const audioPlayType = wx.getStorageSync('audioPlayType') ? wx.getStorageSync('audioPlayType') : 0;
      this.setData({audioPlayType});
    },
    ready: function () {
    }
  }
})
