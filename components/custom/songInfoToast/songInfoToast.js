import request from "../../../utils/request";
import {changeLikeMusic} from "../../../utils/http"

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showSongInfo: {
      type: Boolean,
      value: false
    },
    songInfo: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    likeIdList: [],
    isLike: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeShowInfoToast() {
      this.triggerEvent("changeShowInfo")
    },
    /// 喜欢音乐
    async likeMusic() {
      let {songInfo, isLike} = this.data;
      let res = await changeLikeMusic(songInfo.id, !isLike);
      if (res && res.code === 200) {
        this.setData({isLike: !isLike});
      }
    },
    /**
     * 喜欢的歌单列表
     */
    async getLikeList() {
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo) return;
      let res = await request({url: "/likelist", data: {uid: userInfo.id}});
      if (res && res.ids) {
        wx.setStorageSync('likeIdList', res.ids);
        this.setData({getLikeList: res.ids});
      }
    },
    getIsLikeType() {
      let {likeIdList, songInfo} = this.data;
      let isLike = likeIdList.includes(songInfo.id);
      this.setData({isLike});
    },
    notSupported() {
      wx.showToast({
        title: '暂未开放',
        icon: "none"
      })
    }
  },
  lifetimes: {
    attached: function() {
      let likeIdList = wx.getStorageSync('likeIdList');
      this.setData({likeIdList});
      if (!likeIdList) {
        this.getLikeList().then(() => {
          this.getIsLikeType();
        });
      } else {
        this.getIsLikeType();
      }
    }
  }
})
