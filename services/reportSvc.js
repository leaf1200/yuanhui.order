
const wProvince = require('../models/ProvincesCity.js');
const Promise = require('promise');
//const https = require('https');
const axios = require('axios');
const YuanHuiApi = require('./yuanhuiApi.js');
const async = require('async');
const wOrder = require('../models/worder.js');
const wsendOrder = require('../models/sendOrder.js');
const wProducts = require('../models/wProduct.js');
const global = require('../services/global.js');
var md5 = require('md5');

var ReportSvc = function() {};


ReportSvc.prototype.getProvinceCode = function( addrName ) {
    return new Promise((resolve, reject) => {
        var ret = [];
        if ( addrName.length() === 2 )
          addrName = addrName+'市';
        wProvince.findOne({
           Name:{ $regex:"^"+addrName+"?"}
         }).then((sDoc) => {
            if ( sDoc  != null )
            return resolve({Id:sDoc.ID});
            else {
              return resolve({Id:0});
            }
          }).catch(err => {
            return reject(err);
          });
    });
};



ReportSvc.prototype.sendOrder = function(pInfo) {
 return new Promise((resolve, reject) => {
  var jdata = pInfo

  if ( jdata.test === true )
  {
    return resolve({code:0,msg:"success"});
  }
  var msg = jdata.msg;
  var signString = global.yzSet.appid + msg + global.yzSet.appsecret;
  var sign = md5(signString);

  if( sign != jdata.sign){
      console.log('err');
      return resolve({code:0,msg:'success'});
  }

  msg = decodeURIComponent(msg);
  /**
   * msg是经过unicode（UTF-8）编码的消息对象,所以要进行解码
   */
  msg = JSON.parse(msg);
  msg = msg.trade;


  if(jdata.type === 'TRADE'){
      //处理交易信息

  }

  if(jdata.type === 'ITEM' ||  jdata.type === 'POINTS'){
      //处理商品信息
    return resolve({code:0,msg:"success"});
  }

  var orderNo = jdata.id; //订单编号
  var s_Id = jdata.kdt_id; //店铺id 现在对应于 缘会 的 sku_id

  var orders=[];

  for( var j=0; j < msg.orders.length ; j++)
    orders.push({
      sku_id:msg.orders[j].sku_id,
      fenxiao_payment:msg.orders[j].fenxiao_payment,
      num:msg.orders[j].num,
      outer_sku_id:msg.orders[j].outer_sku_id,
      title:msg.orders[j].title,
      outer_item_id:msg.orders[j].outer_item_id,
      price:msg.orders[j].price,
      state_str:msg.orders[j].state_str,
      total_fee:msg.orders[j].total_fee
    });
  var c_Date = new Date();
  var toDate = c_Date.getFullYear()+'-'+(c_Date.getMonth()+1)+'-'+c_Date.getDate()+' '+c_Date.getHours()+':'+c_Date.getMinutes()+':'+c_Date.getSeconds();

  wOrder.findOneAndUpdate({
       orderId: orderNo
   }, {
     orderId : orderNo,
     signtime : msg.signtime,
     consign_time : msg.consign_time,
     trade_memo : msg.trade_memo,
     transaction_tid : msg.transaction_tid,
     num:msg.num,

     outer_tid : msg.outer_tid,
     receiver_address : msg.receiver_address,
     pay_type : msg.pay_type,
     address:{receiver_district : msg.receiver_district,
     receiver_city : msg.receiver_city,
     receiver_state : msg.receiver_state,
     receiver_zip : msg.receiver_zip,
     stateId:0,
     cityId:0,
     districtId:0
     },
     created:toDate,
     title : msg.title,
     buyer_message : msg.buyer_message,
     pay_time: msg.pay_time,
     payment: msg.payment,
     refunded_fee: msg.refunded_fee,
     refund_state: msg.refund_state,
     type: msg.type,
     status: msg.status,
     update_time: msg.update_time,
     receiver_mobile : msg.receiver_mobile,
     receiver_name : msg.receiver_name,
     total_fee : msg.total_fee,

     orders:orders

   }, {new: true,upsert:true}).then(data => {
    var tParams = {name:msg.receiver_name,cell:msg.receiver_mobile,orderNo:orderNo,province:0,city:0,area:0,township:0,
      address:msg.receiver_state+msg.receiver_city+msg.receiver_district+msg.receiver_address
    };

      var yhApi = new YuanHuiApi();
      //yhApi.getOpenId(code);
      async.each(orders, (ts, callback) =>{

       wProducts.findOne({skuid:ts.outer_item_id}).then((sDoc) => {
          if ( sDoc == null )
          {
           callback();
          }
          else {

          var wtorder = new wsendOrder();
          wtorder.cellphone = tParams.cell;
          wtorder.ordercode = tParams.orderNo;
          wtorder.productname = ts.title;
          wtorder.series = sDoc.series; //'LF/AMN/GC选一填入',
          wtorder.stage = sDoc.stage; //'1段/2段/3段/4段/5段',
          wtorder.specifications = sDoc.specifications; //'XXG：如400G,850G等',
          wtorder.name = tParams.name;
          wtorder.province = tParams.province;
          wtorder.city = tParams.city;
          wtorder.area = tParams.area;
          wtorder.township = tParams.township;
          wtorder.orderstatus = ts.state_str;
          wtorder.address = tParams.address;
          wtorder.skuid = ts.outer_item_id;
          wtorder.skunum = ts.num;
          wtorder.skumoney = ts.price;
          wtorder.ordermoney = ts.total_fee;
          wtorder.backmoney = '0.0';
          wtorder.gettype = 'SaveOrder';
          wtorder.source = 'smnua';


          yhApi.SendOrder(tParams, ts,sDoc ).then(i => {
            console.log(i);
            wtorder.retcode = i.code;
            wtorder.msg = i.msg;
            wtorder.save().then( rd=> {
             callback();
            }).catch(err => {
              callback();
            });
          }).catch(err => {
            callback();
          });
         }

         }).catch(err => {
           callback();
         });

        }, (err) => {//sync 6
          resolve({code:0,msg:"success"});
        });//sync6

   }).catch(err => {
       resolve({code:0,msg:"success"});
   });

  return resolve({code:0,msg:"success"});//{"code":0,"msg":"success"}); // {code:0,msg:"success"});
 });
};


ReportSvc.prototype.getOpenId = function(code) {
  console.log('1');
  var yhApi = new YuanHuiApi();
  yhApi.getOpenId(code);

};




module.exports = ReportSvc;
