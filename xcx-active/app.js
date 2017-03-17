//app.js
App({
  onLaunch: function () {
    wx.removeStorageSync('shoppingcarData');
    this.wxLogFn()
  },
  wxLogFn: function () {
    var that = this;
    var util = require('utils/md5.js');
    wx.login({
      success: function (res) {
        var sign = util.hexMD5('code='+res.code+that.key);
        if (res.code) {
          //发起网络请求
          wx.request({
            url: that.http + 'xcx/common/login',
            data: {
              code: res.code,
              sign: sign
            },
            header: { 'content-type': 'application/json' },
            success: function (res) {
              console.log(res)
              wx.setStorageSync('wxData', {
                "wxOpenid": res.data.data.wxOpenid,
                "clientId": res.data.data.clientId
              });
            },
            fail: function () {
              console.log(res)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  http: "https://xcx.51zhongzi.com/farms-msi/",
  key: '&key=9da1ec1d11f0401968d52cab64df46d8'
})