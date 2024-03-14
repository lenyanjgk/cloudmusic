var bsurl = require('../../../utils/bsurl.js'); // 引入文件路径为'../../../utils/bsurl.js'的模块，并赋值给变量bsurl
var common = require('../../../utils/util.js'); // 引入文件路径为'../../../utils/util.js'的模块，并赋值给变量common
var async = require("../../../utils/async.js"); // 引入文件路径为'../../../utils/async.js'的模块，并赋值给变量async
var nt = require("../../../utils/nt.js"); // 引入文件路径为'../../../utils/nt.js'的模块，并赋值给变量nt
var app = getApp(); // 获取全局应用实例并赋值给变量app

var util = require('../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    motto: 'Hello World',
    userInfo: {},
    userProfile:{
      job:'管理员',
      location:'广州',
      profession:'微信启动队',
      email:'iscooleye@163.com',
      wechat:'wxqidondui',
      mobile:'123456789',
      github:'',
      introduction:''
    },
    logs: [],
    modalHidden: true,
    toastHidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      console.log(userInfo)
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  switchModal: function() {
    this.setData({
      modalHidden: !this.data.modalHidden
    })
  },

  onShareAppMessage: function () {
    return {
      title: '微信 爱学习',
      path: '/pages/about/index?id=123',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  hideToast: function() {
    this.setData({
      toastHidden: true
    })
  },
  clearLog: function(e) {
    wx.setStorageSync('logs', [])
    this.switchModal()
    this.setData({
      toastHidden: false
    })
    this.getLogs()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    wx.setNavigationBarTitle({
      title: '任务记录'
    })
    this.getLogs()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },
  getLogs: function() {
    let logs = wx.getStorageSync('logs')
    logs.forEach(function(item, index, arry) {
      item.startTime = new Date(item.startTime).toLocaleString()
    })
    this.setData({
      logs: logs
    })
  },
})