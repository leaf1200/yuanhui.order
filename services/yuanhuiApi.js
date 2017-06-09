
const axios = require('axios');
const Promise = require('promise');
const   iconv = require('iconv-lite');
var  BufferHelper = require('bufferhelper');
var urlencode = require('urlencode');
var md5 = require('md5');
var YuanHuiApi = function() {};
var url = require('url'); // Comes with Node.
var querystring = require('querystring');
const moment = require('moment');
const async = require('async');


YuanHuiApi.prototype.sign = function(params) {
    var stringA = '';
    _.forEach(_.keys(params), x => {
        stringA += x + '=' + params[x] + '&';
    });
    var stringSignTemp = stringA + 'key=' + global.MCHSECRET;
    return md5(stringSignTemp).toUpperCase();
};

YuanHuiApi.prototype.getCode = function() {
    return new Promise((resolve, reject) => {

      axios({
      method: 'get',
      url: 'https://online.esurl.cn/GetWeiApi/GetOpenId.aspx?getresult=code&acid=smnua&secret=A5xU8SbR!zl&redirecturl=http://180.169.11.52:3001/getOpenId',//'+urlencode('http://180.169.11.52:3001/getOpenId'), //http%3A%2F%2F180.169.11.52%3A3001%2FgetOpenId',//http://180.169.11.52:3001/getOpenId',
      headers: {'User-Agent':'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; Chitanda/Akari) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 micromessenger/6.0.0.58_r884092.501 NetType/WIFI'},
      responseType: 'arraybuffer'
      }).then(function(response) {
       var str = response.data;
       str = iconv.decode(str, 'gb2312');
       return resolve(iconv.decode(response.data,'utf-8'));
       //return resolve('THIS IS TEST');
     }).catch(function (error) {

     });
    });
};

YuanHuiApi.prototype.getFans = function(fans_id) {
    return new Promise((resolve, reject) => {

      axios({
      method: 'get',
      url: 'https://open.youzan.com/api/entry/youzan.users.weixin.follower/3.0.0/get?fans_id='+fans_id,
      headers: {'User-Agent':'Mozilla/5.0 (Linux; U; Android 4.1.2; zh-cn; Chitanda/Akari) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 micromessenger/6.0.0.58_r884092.501 NetType/WIFI'},
      responseType: 'arraybuffer'
      }).then(function(response) {
       var str = response.data;
       str = iconv.decode(str, 'gb2312');
       return resolve(iconv.decode(response.data,'utf-8'));
       //return resolve('THIS IS TEST');
     }).catch(function (error) {

     });
    });
};


YuanHuiApi.prototype.getOpenId = function(code) {
    return new Promise((resolve, reject) => {

      axios({
      method: 'post',
      url: 'https://online.esurl.cn/GetWeiApi/GetOpenId.aspx?',
      data: 'getresult=snsapi_base&acid=smnua&secret=A5xU8SbR!zl&code='+code
      }).then(function(response) {

     }).catch(function (error) {

     });
    });
};

YuanHuiApi.prototype.SendOrder = function(tinfo,pInfo,sDoc) {
    return new Promise((resolve, reject) => {
      var signDate = '';
      signDate = moment().format('YYYYMMDDHHmmss');

      var signString = signDate+'smnua@!#A5xU8SbR!zl'+'smnua'+'SaveOrder';
      var productname = '';
      if ( pInfo.sku_properties_name.indexOf('规格:') >=0 )
      {
         productname = pInfo.sku_properties_name.substring(pInfo.sku_properties_name.indexOf('规格:')+4);
      }
      else {
        productname = pInfo.sku_properties_name;
      }

      var sign = md5(signString).toUpperCase();
      var params = {
          cellphone: tinfo.cell,
          ordercode:tinfo.orderNo,
          productname:productname,
          series:sDoc.series, //'LF/AMN/GC选一填入',
          stage:sDoc.stage, //'1段/2段/3段/4段/5段',
          specifications:sDoc.specifications, //'XXG：如400G,850G等',
          name:tinfo.name,
          province:tinfo.province,
          city:tinfo.city,
          area:tinfo.area,
          township:tinfo.township,
          orderstatus:pInfo.state_str,
          address:tinfo.address,
          skuid:parseInt(pInfo.outer_sku_id),
          skunum:parseInt(pInfo.num),
          skumoney:pInfo.price,
          ordermoney:pInfo.total_fee,
          backmoney:'0.0',
          gettype:'SaveOrder',
          source:'smnua',
          sign:sign,
          date:signDate

      };

      var urlf = querystring.stringify(params);

      var retData={err_msg:'',err_code:'0'};
      var retCode = 0;
      var pTimes = [1,2,3];
      async.eachSeries(pTimes, (tm, callback) =>{//each 1

      if ( retData.err_code != '0' )
      {
        callback();
      }
      else
      {
      axios({
      method: 'post',
      url:'https://online.esurl.cn/NUAApi/RecruitAPI.ashx/',
      data: urlf
      }).then(function(response) {
       retData = response.data;
       callback();
     }).catch(function (error) {

      callback();
     });
     }
   }, (err) => {
     return resolve({code:retCode,msg:retData.err_msg});
   });//each 1

    });
};



YuanHuiApi.prototype.updateOrder = function(tinfo,pInfo,sDoc) {
    return new Promise((resolve, reject) => {
      var signDate = '';
      signDate = moment().format('YYYYMMDDHHmmss');

      var signString = signDate+'smnua@!#A5xU8SbR!zl'+'smnua'+'ChangeStatus';

      var sign = md5(signString).toUpperCase();
      var params = {
          cellphone: tinfo.cell,
          ordercode:tinfo.orderNo,
          orderstatus:pInfo.state_str,
          gettype:'ChangeStatus',
          source:'smnua',
          sign:sign,
          date:signDate

      };

      var urlf = querystring.stringify(params);

      var retData={err_msg:'',err_code:'0'};
      var retCode = 0;
      var pTimes = [1,2,3];
      async.eachSeries(pTimes, (tm, callback) =>{//each 1

      if ( retData.err_code != '0' )
      {
        callback();
      }
      else
      {
      axios({
      method: 'post',
      url:'https://online.esurl.cn/NUAApi/RecruitAPI.ashx/',
      data: urlf
      }).then(function(response) {
       retData = response.data;
       callback();
     }).catch(function (error) {

      callback();
     });
     }
   }, (err) => {
     return resolve({code:retCode,msg:retData.err_msg});
   });//each 1

    });
};

YuanHuiApi.prototype.SendVerifyCode = function(cellPhone) {
    return new Promise((resolve, reject) => {
      var tdate = Date.now();

      var params = {
          gettype:'SendVerify',
          cellphone: cellPhone,
          mch_id: global.MCHID,
          nonce_str: randomize('A0', 32)
      };


      axios({
      method: 'post',
      url: 'https://online.esurl.cn/NUAApi/RecruitAPI.ashx/',
      data: 'gettype=SendVerifyCode&sign='+ ' &secret=A5xU8SbR!zl&cellphone='+cellPhone
      }).then(function(response) {

     }).catch(function (error) {

     });
    });
};



/*YuanHuiApi.prototype.SendTestOrder = function() {
    return new Promise((resolve, reject) => {
      var signDate = '';
      signDate = moment().format('YYYYMMDDHHmmss');

      var signString = signDate+'smnua@!#A5xU8SbR!zl'+'smnua'+'SaveOrder';

      var sign = md5(signString).toUpperCase();
      var params = {
        cellphone:'15821824640',
        ordercode:'E20170608111434089893127',
        productname:'美赞臣0元购专享活动奶粉',
        series:'AMN',
        stage:'2段',
        specifications:'400G',
        name:'杭小琴',
        province:0,
        city:0,
        area:0,
        township:0,
        orderstatus:'待发货',
        address:'上海市上海市普陀区岚皋西路95弄8号602室',
        skuid:1431723,
        skunum:1,
        skumoney:134.50,
        ordermoney:134.50,
        backmoney:0.0,
        gettype:'SaveOrder',
        source:'smnua',
        sign:sign,
        date:signDate

      };

      var urlf = querystring.stringify(params);

      var retData={err_msg:'',err_code:'0'};
      var retCode = 0;
      var pTimes = [1,2,3];
      async.eachSeries(pTimes, (tm, callback) =>{//each 1

      if ( retData.err_code != '0' )
      {
        callback();
      }
      else
      {
      axios({
      method: 'post',
      url:'https://online.esurl.cn/NUAApi/RecruitAPI.ashx/',
      data: urlf
      }).then(function(response) {
       retData = response.data;
       callback();
     }).catch(function (error) {

      callback();
     });
     }
   }, (err) => {
     return resolve({code:retCode,msg:retData.err_msg});
   });//each 1

    });
};*/


module.exports = YuanHuiApi;
