
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
// 引入有赞SDK
var SDK = require('youzan-sdk');
// 初始化SDK，在 https://koudaitong.com/v2/apps/open/setting 开启API接口，复制相应 AppID、AppSecert
var sdk = SDK({key: '759e2f7afdef69dcac', secret: 'f3fe09621d4b0b34763cbd2bcdc39b5e'});

var ReportSvc = function() {};


ReportSvc.prototype.getProvinceCode = function( addrState,addrCity,addrDistrict ) {
    return new Promise((resolve, reject) => {
        var ret = [];
        var spe_State = '上海市,北京市,天津市,重庆市,';

        if ( spe_State.indexOf(addrState+',') >=0)
        {
           addrCity = addrDistrict;
           addrDistrict = '';
        }

        var l1Id = l2Id = l3Id = l4Id = 0;

        wProvince.findOne({
           Name:{ $regex:"^"+addrState},
           LevelNum:1
         }).then((sDoc) => {
            if ( sDoc  != null )
            {
              l1Id = sDoc.ID;
              wProvince.findOne({
                 Name:{ $regex:"^"+addrCity},
                 LevelNum:2,
                 ParentID:l1Id
               }).then((cDoc) => {
              if ( cDoc  != null )
              {
                l2Id = cDoc.ID;
                wProvince.findOne({
                   Name:{ $regex:"^"+addrDistrict},
                   LevelNum:3,
                   ParentID:l2Id
                 }).then((dDoc) => {
                   if ( dDoc  != null )
                   {
                     l3Id = dDoc.ID;
                     wProvince.findOne({
                        LevelNum:4,
                        ParentID:l3Id
                      }).then((countyDoc) => {
                        if ( countyDoc  != null )
                        {
                           l4Id = countyDoc.ID;
                           return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
                        }
                        else
                          return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
                      }).catch(err => {
                        return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
                      });
                   }
                   else
                    return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
                 }).catch(err => {
                   return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
                 });
              }
              else
               return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
            }).catch(err => {
              return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
            });
            }
            else {
              return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
            }
          }).catch(err => {
            return resolve({l1:l1Id,l2:l2Id,l3:l3Id,l4:l4Id});
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
  var app_id = pInfo.app_id;
  var signString = global.yzSet.appid + msg + global.yzSet.appsecret;
  var sign = md5(signString);

  if( sign != jdata.sign){
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
      total_fee:msg.orders[j].total_fee,
      sku_properties_name: msg.orders[j].sku_properties_name
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
     outer_user_id:msg.outer_user_id,
     app_id:app_id,

     fans_info:{
       fans_nickname : msg.fans_info.fans_nickname,
       fans_id:msg.fans_info.fans_id,
       fans_type:msg.fans_info.fans_type,
       buyer_id:msg.fans_info.buyer_id
    },

     orders:orders

   }, {new: true,upsert:true}).then(data => {

    this.getProvinceCode(msg.receiver_state,msg.receiver_city,msg.receiver_district).then( r_add => {

    var tParams = {name:msg.receiver_name,cell:msg.receiver_mobile,orderNo:orderNo,province:r_add.l1,city:r_add.l2,area:r_add.l3,township:r_add.l4,
      address:msg.receiver_state+msg.receiver_city+msg.receiver_district+msg.receiver_address
    };

      var yhApi = new YuanHuiApi();
      //yhApi.getFans(msg.fans_info.fans_id).then(fans=>{ //get fans
      async.each(orders, (ts, callback) =>{//each order
       wProducts.findOne({skuid:ts.outer_sku_id}).then((sDoc) => {


          if ( (sDoc == null) || (( msg.status.indexOf("WAIT_SELLER_SEND_GOODS")<0 ) && (msg.status.indexOf("TRADE_BUYER_SIGNED")<0) ) ) //WAIT_SELLER_SEND_GOODS TRADE_BUYER_SIGNED
          {
           callback();
          }
          else {//else 1

          var wtorder = new wsendOrder();
          wtorder.cellphone = tParams.cell;
          wtorder.ordercode = tParams.orderNo;
          wtorder.productname = ts.title+ts.sku_properties_name;
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
          wtorder.skuid = ts.outer_sku_id;
          wtorder.skunum = ts.num;
          wtorder.skumoney = ts.price;
          wtorder.ordermoney = ts.total_fee;
          wtorder.backmoney = '0.0';
          wtorder.gettype = 'SaveOrder';
          wtorder.source = 'smnua';

          //wtorder.openid = fans.response.user.weixin_openid;

          if ( msg.status.indexOf('WAIT_SELLER_SEND_GOODS') >= 0 )
          {//买家已付款
          yhApi.SendOrder(tParams, ts,sDoc ).then(i => {
            wtorder.retcode = i.code;
            wtorder.msg = i.msg;
            wtorder.gettype = 'SaveOrder';
            //
            sdk.get('youzan.users.weixin.follower/3.0.0/get', {
              fans_id: msg.fans_info.fans_id

            }).then(function(fans) {
                wtorder.openid = fans.response.user.weixin_openid;
                wtorder.save().then( rd=> {
                  callback();
                }).catch(err => {
                 callback();
                });
            }).catch(err => {
              wtorder.openid = '';
              wtorder.save().then( rd=> {
                callback();
              }).catch(err => {
               callback();
              });
            }); //get fans
            //
          }).catch(err => {
            callback();
          });
         }//买家已付款
         else
         if ( msg.status.indexOf('TRADE_BUYER_SIGNED') >= 0 )
         {//买家已签收
           ts.state_str = '买家已签收';
           yhApi.updateOrder(tParams, ts,sDoc ).then(i => {
             wtorder.retcode = i.code;
             wtorder.msg = i.msg;
             wtorder.orderstatus = '买家已签收';
             wtorder.gettype = 'ChangeStatus';

             sdk.get('youzan.users.weixin.follower/3.0.0/get', {
               fans_id: msg.fans_info.fans_id

             }).then(function(fans) {
             wtorder.openid = fans.response.user.weixin_openid;
             wtorder.save().then( rd=> {
              callback();
             }).catch(err => {
               callback();
             });
           }).catch(err => {
             wtorder.openid = '';
             wtorder.save().then( rd=> {
               callback();
             }).catch(err => {
              callback();
             });
           }); //get fans
             //
           }).catch(err => {
             callback();
           });

         }//买家已签收
         else
           callback();

         }//else 1

         }).catch(err => {
           callback();
         });

        }, (err) => {//sync 6
          resolve({code:0,msg:"success"});
        });//sync6 //each order
      }).catch(err => {
        resolve({code:0,msg:"success"});
      });
   }).catch(err => {
       resolve({code:0,msg:"success"});
   });

  return resolve({code:0,msg:"success"});//{"code":0,"msg":"success"}); // {code:0,msg:"success"});
 });
};


/*ReportSvc.prototype.getOpenId = function() {

  var yhApi = new YuanHuiApi();
  yhApi.SendTestOrder();

};*/


module.exports = ReportSvc;
