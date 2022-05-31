import config from './config';

function request({url, data = {}, method = 'GET'}) {
  return new Promise((resolve, reject) => {
    let cookies = wx.getStorageSync('cookies');
    wx.request({
      url: config.domain + url,
      data,
      method,
      header: {
        cookie: cookies ? cookies.find(item => item.indexOf('MUSIC_U') > -1) : ''
      },
      success: (res) => {
        /// 登录接口获取cookies
        if (data['isLogin']) {
          wx.setStorageSync('cookies', res.cookies);
        }
        resolve(res.data);
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: "请求超时, 请检查网络",
        })
        reject(err);
      }
    })
  })
}

export default request;