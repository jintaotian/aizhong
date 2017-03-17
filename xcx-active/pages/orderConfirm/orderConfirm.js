// pages/orderConfirm/orderConfirm.js
var gConfig = getApp();
var util = require('../../utils/md5.js');
Page({
  data: {value: '请选择收货地址'},
  onLoad: function () {
  },
  onShow: function () {
    // 页面显示
    var that = this;
    var orderData = wx.getStorageSync('orderData');
    var userData = wx.getStorageSync('userData');
    that.setData({
      orderData: orderData,
    })
    var addressData = wx.getStorageSync('addressData');
    if (addressData) {
      //当地址自己选择时
      that.setData({
        value: addressData.regionName + addressData.address,
        mobile: addressData.mob,
        name: addressData.consignee,
        id: addressData.id
      })
    } else {
      //获取默认地址
      that.setDefaultAddrFn();
    }
    // 从后台获取商品相关数据
    that.getOrderInfoFn(userData.region, orderData)
  },
  addrOptFn: function () {
    wx.navigateTo({
      url: '../addrOpt/addrOpt'
    })
  },
  placeOrderFn: function () {
    // 下单方法
    var that = this;
    var orderInfoData = that.data.orderData;
    var userData = wx.getStorageSync('userData');
    var wxData = wx.getStorageSync('wxData');
    var itemListData = [];
    for (var i = 0; i < orderInfoData.length; i++) {
      itemListData.push({
        "id": orderInfoData[i].id,
        "qty": orderInfoData[i].moq
      })
    }
    wx.request({
      url: gConfig.http + 'xcx/order/save',
      data: {
        data: {
          "appId": "wxaf16046e5515de4c",
          "clientAddrId": that.data.id,
          "buyer": wxData.clientId,
          "itemCartsList": [
            {
              "companyId": userData.companyId,
              "couponId": that.data.couponId,
              "itemList": itemListData,
              "key": "N" + userData.companyId
            }
          ],
          "logisticsId": 0,
          "orderSource": 3,
          "payMode": 1,
          "seller": userData.companyId,
          "region": userData.region
        }
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        // 微信支付接口
        wx.requestPayment({
          'timeStamp': res.data.data.timeStamp,
          'nonceStr': res.data.data.nonceStr,
          'package': res.data.data.package,
          'signType': 'MD5',
          'paySign': res.data.data.paySign
        })
        // 微信支付接口
      },
      complete: function () {
        wx.removeStorageSync('shoppingcarData');
        wx.removeStorageSync('addressData')
      }
    })
  },
  getOrderInfoFn: function (region, itemList) {
    var that = this;
    var itemListData = [];
    for (var i = 0; i < itemList.length; i++) {
      itemListData.push({
        qty: itemList[i].moq,
        skuId: itemList[i].id
      })
    }
    wx.request({
      url: gConfig.http + 'xcx/order/itemsAmount',
      data: {
        data: {
          region: region,
          itemList: itemListData
        }
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
        // 重新渲染页面
        that.setData({
          totalPrice: res.data.data.total,
          coupon: res.data.data.discount,
          couponId: res.data.data.couponId
        })
      }
    })
  },
  setDefaultAddrFn: function () {
    var that = this;
    var userData = wx.getStorageSync('userData');
    var wxData = wx.getStorageSync('wxData');
    var sign = util.hexMD5('clientId=' + wxData.clientId + gConfig.key);
    wx.request({
      url: gConfig.http + 'xcx/address/list',
      data: {
        clientId: wxData.clientId,
        sign:sign
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var addrList = res.data.data.list;
        for (var i = 0; i < addrList.length; i++) {
          if (addrList[i].isDefault == 1) {
            that.setData({
              value: addrList[i].regionName + addrList[i].address,
              mobile: addrList[i].mob,
              name: addrList[i].consignee,
              id: addrList[i].id
            })
          }
        }
      }
    })
  }
})
