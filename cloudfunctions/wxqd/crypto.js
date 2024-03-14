// 参考 https://github.com/darknessomi/musicbox/wiki/
'use strict'

// 导入所需的模块
const crypto = require('crypto'); // 用于加密解密操作的模块
const bigInt = require('big-integer'); // 用于处理大整数运算的模块

// RSA加密所需的模数、随机数和公钥
const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7';
const nonce = '0CoJUm6Qyw8W8jud';
const pubKey = '010001';

// 扩展String对象的方法，用于将字符串转换成16进制编码
String.prototype.hexEncode = function(){
    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += (""+hex).slice(-4);
    }
    return result;
}

// 生成指定长度的随机密钥
function createSecretKey(size) {
    var keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var key = "";
    for (var i = 0; i < size; i++) {
        var pos = Math.random() * keys.length;
        pos = Math.floor(pos);
        key = key + keys.charAt(pos)
    }
    return key;
}

// 使用AES算法对文本进行加密
function aesEncrypt(text, secKey) {
    var _text = text;
    var lv = new Buffer('0102030405060708', "binary");
    var _secKey = new Buffer(secKey, "binary");
    var cipher = crypto.createCipheriv('AES-128-CBC', _secKey, lv);
    var encrypted = cipher.update(_text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

// 在字符串前补0，使其达到指定长度
function zfill(str, size) {
    while (str.length < size) str = "0" + str;
    return str;
}

// 使用RSA算法对文本进行加密
function rsaEncrypt(text, pubKey, modulus) {
    var _text = text.split('').reverse().join('');
    var biText = bigInt(new Buffer(_text).toString('hex'), 16),
        biEx = bigInt(pubKey, 16),
        biMod = bigInt(modulus, 16),
        biRet = biText.modPow(biEx, biMod);
    return zfill(biRet.toString(16), 256);
}

// 对输入对象进行加密
function Encrypt(obj) {
    var text = JSON.stringify(obj); // 将对象转换为JSON字符串
    var secKey = createSecretKey(16); // 生成随机密钥
    var encText = aesEncrypt(aesEncrypt(text, nonce), secKey); // 先使用AES算法对文本进行两次加密
    var encSecKey = rsaEncrypt(secKey, pubKey, modulus); // 使用RSA算法对随机密钥进行加密
    return {
        params: encText,
        encSecKey: encSecKey
    };
}

// 导出Encrypt函数
module.exports = Encrypt;
