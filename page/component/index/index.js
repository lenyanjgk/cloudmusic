var util = require('../../../utils/utils');
var bsurl = require('../../../utils/bsurl.js'); // 引入文件路径为'../../../utils/bsurl.js'的模块，并赋值给变量bsurl
var common = require('../../../utils/util.js'); // 引入文件路径为'../../../utils/util.js'的模块，并赋值给变量common
var async = require("../../../utils/async.js"); // 引入文件路径为'../../../utils/async.js'的模块，并赋值给变量async
var nt = require("../../../utils/nt.js"); // 引入文件路径为'../../../utils/nt.js'的模块，并赋值给变量nt
var app = getApp(); // 获取全局应用实例并赋值给变量app


const defaultLogName = {
  work: '工作',
  rest: '休息'
}
const actionName = {
  stop: '停止',
  start: '开始'
}

const initDeg = {
  left: 45,
  right: -45,
}

Page({

  data: {
    remainTimeText: '',
    timerType: 'work',
    log: {},
    completed: false,
    isRuning: false,
    leftDeg: initDeg.left,
    rightDeg: initDeg.right
  },

  onShow: function() {
    nt.addNotification("music_next", this.music_next, this); // 添加消息通知的监听事件，监听音乐更新
    nt.addNotification("music_toggle", this.music_toggle, this); // 添加消息通知的监听事件，监听音乐播放状态更新
    if (this.data.isRuning) return
    let workTime = util.formatTime(wx.getStorageSync('workTime'), 'HH')
    let restTime = util.formatTime(wx.getStorageSync('restTime'), 'HH')
    this.setData({
      workTime: workTime,
      restTime: restTime,
      remainTimeText: workTime + ':00',
      music: app.globalData.curplay,
      playing: app.globalData.playing,
      playtype: app.globalData.playtype,
    });

    if (!wx.getStorageSync('user')) { // 如果本地缓存中不存在用户信息
      wx.redirectTo({ // 重定向到登录页面
        url: '../login/index'
      });
      return;
    }
    !this.data.rec.loading && this.init(); // 若rec.loading为false，执行初始化操作

  },

  startTimer: function(e) {
    let startTime = Date.now()
    let isRuning = this.data.isRuning
    let timerType = e.target.dataset.type
    let showTime = this.data[timerType + 'Time']
    let keepTime = showTime * 60 * 1000
    let logName = this.logName || defaultLogName[timerType]

    if (!isRuning) {
      this.timer = setInterval((function() {
        this.updateTimer()
        this.startNameAnimation()
      }).bind(this), 1000)
    } else {
      this.stopTimer()
    }

    this.setData({
      isRuning: !isRuning,
      completed: false,
      timerType: timerType,
      remainTimeText: showTime + ':00',
      taskName: logName
    })

    this.data.log = {
      name: logName,
      startTime: Date.now(),
      keepTime: keepTime,
      endTime: keepTime + startTime,
      action: actionName[isRuning ? 'stop' : 'start'],
      type: timerType
    }

    this.saveLog(this.data.log)
  },

  startNameAnimation: function() {
    let animation = wx.createAnimation({
      duration: 450
    })
    animation.opacity(0.2).step()
    animation.opacity(1).step()
    this.setData({
      nameAnimation: animation.export()
    })
  },

  stopTimer: function() {
    // reset circle progress
    this.setData({
      leftDeg: initDeg.left,
      rightDeg: initDeg.right
    })

    // clear timer
    this.timer && clearInterval(this.timer)
  },

  updateTimer: function() {
    let log = this.data.log
    let now = Date.now()
    let remainingTime = Math.round((log.endTime - now) / 1000)
    let H = util.formatTime(Math.floor(remainingTime / (60 * 60)) % 24, 'HH')
    let M = util.formatTime(Math.floor(remainingTime / (60)) % 60, 'MM')
    let S = util.formatTime(Math.floor(remainingTime) % 60, 'SS')
    let halfTime

    // update text
    if (remainingTime > 0) {
      let remainTimeText = (H === "00" ? "" : (H + ":")) + M + ":" + S
      this.setData({
        remainTimeText: remainTimeText
      })
    } else if (remainingTime == 0) {
      this.setData({
        completed: true
      })
      this.stopTimer()
      return
    }

    // update circle progress
    halfTime = log.keepTime / 2
    if ((remainingTime * 1000) > halfTime) {
      this.setData({
        leftDeg: initDeg.left - (180 * (now - log.startTime) / halfTime)
      })
    } else {
      this.setData({
        leftDeg: -135
      })
      this.setData({
        rightDeg: initDeg.right - (180 * (now - (log.startTime + halfTime)) / halfTime)
      })
    }
  },

  changeLogName: function(e) {
    this.logName = e.detail.value
  },

  saveLog: function(log) {
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(log)
    wx.setStorageSync('logs', logs)
  },
  // 播放/暂停切换函数
  toggleplay: function () {
    common.toggleplay(this, app);
  },

// 播放下一首歌曲
playnext: function (e) {
  app.nextplay(e.currentTarget.dataset.pt);
},

// 更新当前播放的音乐信息
music_next: function (r) {
  this.setData({
    music: r.music,
    playtype: r.playtype
  });
},
// 更新播放状态
music_toggle: function (r) {
  this.setData({
    playing: r.playing
  });
},


})
