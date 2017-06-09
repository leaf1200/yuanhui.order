var express = require('express');
var router = express.Router();
//var WechatAPI = require('wechat-api');
const GLOBAL = require('../services/global.js');
//var api = new WechatAPI(GLOBAL.wxSet.appid, GLOBAL.wxSet.appsecret);
const axios = require('axios');
const fs = require('fs');
const Errors = require('../services/errors.js');
const Result = require('../services/result.js');
const ReportSvc = require('../services/reportSvc.js');




router.get('/getsave/:addrName', (req, res, next) => {
    console.log(req.params.addrName);
    var addrName = req.params.addrName;
    var reportSvc = new ReportSvc();
    reportSvc.getProvinceCode(addrName).then(function(result) {
          return  res.json(new Result(Errors.Success,result ));
    }).catch(err => {
        return res.json(new Result(Errors.DBQueryFailed, err));
    });
});

router.get('/getall', (req, res, next) => {
    var reportSvc = new ReportSvc();
    reportSvc.getReportOpenId('all','all').then(function(result) {
          return  res.json(new Result(Errors.Success,result ));
    }).catch(err => {
        return res.json(new Result(Errors.DBQueryFailed, err));
    });
});

router.post('/getorder', (req, res, next) => {
    /*var openId = req.user.openId;
    var itemId = req.body.itemId;
    var alias = req.body.alias;
    var message = req.body.message;
    var score = req.body.score;
    var avatar = req.body.avatar;*/
    //console.log(req.body);
    var reportSvc = new ReportSvc();
    reportSvc.sendOrder(req.body).then(function(result) {
          return  res.json(result );
    }).catch(err => {
        return res.json(err);
    });
});

router.get('/sendOrder', (req, res, next) => {
    var reportSvc = new ReportSvc();
    reportSvc.getOpenId().then(function(result) {
          return  res.json(new Result(Errors.Success,result ));
    }).catch(err => {
        return res.json(new Result(Errors.DBQueryFailed, err));
    });
});


module.exports = router;
