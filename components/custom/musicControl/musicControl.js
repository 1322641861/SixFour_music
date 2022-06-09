// components/custom/musicControl/musicControl.js
const appInstance = getApp();
import {throttle, changeAudioPlayType} from "../../../utils/util";
import PubSub from "pubsub-js";
import moment from "moment";
import request from "../../../utils/request"

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isPlay: {
      type: Boolean,
      value: appInstance.globalData.isPlayMusic
    },
    songInfo: {
      type: Object,
      value: wx.getStorageSync('songInfo')
    },
    songData: {
      type: Object,
      value: wx.getStorageSync('songData')
    },
    bottomSpace: {
      type: String,
      value: 0
    },
    HasBottomHeight: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    songProgressLen: 0,
    initRotate: -135,
    showMusicContainer: false,
    // currentSongSheet: [],
    // audioPlayType: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /// 点击控制台进入播放列表
    clickWholeMusic() {
      const musicId = this.data.songData.musicId;
      appInstance.globalData.musicId = musicId;
      wx.navigateTo({
        url: '/pages/songDetail/songDetail?musicId=' + musicId,
      })
    },
    /// 打开歌单播放列表弹窗
    changeShowMusicContainer() {
      let isShow = this.data.showMusicContainer;
      this.setData({showMusicContainer: !isShow});
    },
    /**
     * 暂停/播放
     */
    changePlayStatus() {
      let {isPlay} = this.data;
      isPlay = !isPlay;
      this.setData({ isPlay });
      appInstance.globalData.isPlayMusic = isPlay;
    },
    changePlayPause() {
      throttle(() => {
        this.changePlayStatus();
        let {songInfo, songData, isPlay} = this.data;
        this.backgroundAudioManager = wx.getBackgroundAudioManager();
        if (isPlay) {
          this.backgroundAudioManager.src = songData.songUrl;
          this.backgroundAudioManager.title = songInfo.name;
        } else {
          this.backgroundAudioManager.pause();
        }
      }, 500)();
    },
    /**
     * 播放下一首
     */
    changePreNextMusic() {
      let {songData} = this.data;
      this.changePlayPause();
      this.setData({
        songData: Object.assign(songData, {
          currentWidth: 0, 
          currentTime: "00:00",
          durationTime: "00:00"
        })
      });
      PubSub.publish("changeMusic", "next");
      PubSub.subscribe('getMusicId', (msg, id) => {
        if (!id) return;
        this.getMusicInfo(id).then(() => {
          this.getMusicUrl(id).then(() => {
            this.changePlayPause();
            this.setMusicData();
          });
        });
        PubSub.unsubscribe("getMusicId");
      })
    },
    /**
     * 获取播放进度(转角度), 显示在圆形进度条中
     * @param {*} songProgressLen 总播放时长 s
     * currentProgressLen 已播放时长 s
     */
    getInitRotate(songProgressLen) {
      let currentProgressLen = Math.floor(this.data.songData.currentWidth / 10) / 100;
      let initRotate = -135 + Math.floor(1800 * currentProgressLen / songProgressLen) / 10;
      if (initRotate)
      return initRotate;
    },
    /// 全局缓存当前歌曲的进度
    setMusicData() {
      const {songInfo, songData} = this.data;
      if (songData['songUrl'] && songInfo['id']) {
        wx.setStorageSync('songInfo', songInfo);
        wx.setStorageSync('songData', songData);
        this.setData({songInfo, songData});
      }
    },
    /**
     * 音乐监听 
     */
    handleBgMusic() {
      this.backgroundAudioManager = wx.getBackgroundAudioManager();
      let waitingTimer;
      this.backgroundAudioManager.onPlay(() => {
        console.log("onplay11111111111111111111111", this.data.isPlay);
        if (!this.data.isPlay) this.changePlayPause();
      })
      this.backgroundAudioManager.onError(() => {
        console.log("onError11111111111111111111111");
        wx.showToast({
          title: '加载错误, 自动播放下一首',
          icon: "none"
        })
        this.changePreNextMusic();
      })
      this.backgroundAudioManager.onEnded(() => {
        console.log("onEnded11111111111111111111111");
        this.changePreNextMusic();
      })
      this.backgroundAudioManager.onCanplay(() => {
        console.log("onCanplay11111111111111111111111");
        if (waitingTimer) clearTimeout(waitingTimer);
        waitingTimer = null;
      })
      this.backgroundAudioManager.onWaiting(() => {
        waitingTimer = setTimeout(() => {
          wx.showToast({
            title: '网速有点慢哦~',
            icon: "none"
          })
        }, 2000);
      })
      this.backgroundAudioManager.onPause(() => {
        console.log("onPause11111111111111111111111", this.data.isPlay);
        if (this.data.isPlay) this.changePlayStatus();
        // 暂停时缓存当前音乐
        this.setMusicData();
      });
      this.backgroundAudioManager.onStop(() => {
        console.log(this);
        if (this) {
          console.log('stop111111111111111');
          this.changePlayMusic(false);
          this.setMusicData();
        }
      });
      this.backgroundAudioManager.onTimeUpdate(() => {
        throttle(() => {
          // console.log('4444444444',this.backgroundAudioManager);
          let bgCurrentTime = this.backgroundAudioManager.currentTime;
          let bgDurationTime = this.backgroundAudioManager.duration;
          if (!bgDurationTime) return;
          let currentTime = moment(bgCurrentTime * 1000).format("mm:ss");
          let currentWidth = bgCurrentTime / bgDurationTime * Math.floor(bgDurationTime * 1000);
          let songData = this.data.songData;
          songData.currentTime = currentTime;
          songData.currentWidth = currentWidth;
          this.setData({songData});
          this.setMusicData();
        }, 500)();
      })
    },
     /**
     * 切换下一首时更新数据
     */
    subscribeUpdateMusic() {
      PubSub.subscribe("changeAndUpdateMusic", (msg, type) => {
        const songData = wx.getStorageSync('songData');
        const songInfo = wx.getStorageSync('songInfo');
        const isPlay = appInstance.globalData.isPlayMusic;
        if (songInfo['id'] && songData['songUrl']) {
           this.setData({ songData, songInfo, isPlay })
        }
        /// 监听当前歌曲是否属于当前播放歌单列表
        const currentSongSheet = wx.getStorageSync('currentSongSheet', this.data.searchDetailList);
        if (currentSongSheet && currentSongSheet.length) {
          let currentSong = currentSongSheet.find(item => item['id'] === songData['musicId']);
          if (currentSong) wx.setStorageSync('currentSongId', currentSong['id']);
        }
      })
    },
    /**
     * 获取歌曲信息
     */
    async getMusicInfo(musicId) {
      let res = await request({url: '/song/detail', data: {ids: musicId}});
      if (res) {
        let song = res.songs[0];
        let durationTime = moment(song.dt).format("mm:ss");
        let songData = this.data.songData;
        songData.durationTime = durationTime;
        songData.musicId = musicId;
        this.setData({
          songInfo: song,
          songData
        });
      }
    },
    /**
     * 获取歌曲url
     */
    async getMusicUrl(id) {
      let res = await request({url: '/song/url', data: {id: id}});
      if (res) {
        let songData = this.data.songData;
        songData.songUrl = res.data[0].url;
        songData.musicId = id;
        this.setData({songData});
      }
    },
  }, 
  lifetimes: {
    created: function () {
      this.handleBgMusic();
      appInstance.globalData.musicId = this.data.musicId;
    },
    attached: function() {
      // 在组件实例进入页面节点树时执行
      this.subscribeUpdateMusic();
    },
    ready: function () {
      const {songData, songInfo} = this.data;
      if (!songData || !songInfo) return;
      let songProgressLen = Math.floor(songInfo.dt / 10) / 100;
      let initRotate = this.getInitRotate(songProgressLen);
      this.setData({
        songProgressLen,
        initRotate
      })
    },
    moved: function () {
      // console.log('moved...');
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      // console.log('detached...');
    },
  },
  options: {
    styleIsolation: 'isolated'
  }
})
