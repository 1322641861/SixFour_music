import config from './config';

function request({url, data = {}, method = 'GET', header = {}}) {
  return new Promise((resolve, reject) => {
    let cookies = wx.getStorageSync('cookies');
    if (!config.hideLoadingApi.includes(url)) {
      wx.showLoading({title: '加载中...'});
    }
    wx.request({
      url: config.domain + url,
      // url: config.localDomain + url,
      data,
      method,
      header: Object.assign(header, {
        cookie: cookies ? cookies.find(item => item.indexOf('MUSIC_U') > -1) : ''
      }),
      success: (res) => {
        /// 登录接口获取cookies
        if (config.loginApi.includes(url)) {
          wx.setStorageSync('cookies', res.cookies);
        }
        if (!config.hideLoadingApi.includes(url)) {
          wx.hideLoading();
        }
        resolve(res.data);
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: "请求超时, 请检查网络",
          icon: "none"
        })
        reject(err);
      }
    })
  })
}

export default request;