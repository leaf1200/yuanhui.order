var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var wOrderSchema = new Schema({
    orderId: String,
    signtime: {
        type: String,
        default: () => {
            return moment().format('YYYY-MM-DD HH:mm:ss')
        }
    },
    consign_time: {
        type: String,
        default: () => {
            return moment().format('YYYY-MM-DD HH:mm:ss')
        }
    },
    created: {
        type: String,
        default: () => {
            return moment().format('YYYY-MM-DD HH:mm:ss')
        }
    },
    trade_memo:String,
    num:Number,
    transaction_tid:String,
    outer_tid:String,
    receiver_address:String,
    pay_type:String,

    address:{
    receiver_district:String,
    receiver_city:String,
    receiver_state:String,
    receiver_zip:String,
    districtId:Number,
    cityId:Number,
    stateId:Number
    },

    orders:[
      {
        sku_id:Number,
        fenxiao_payment:String,
        num:Number,
        outer_sku_id:String,
        title:String,
        outer_item_id:String,
        price:String,
        state_str:String,
        total_fee:String
      }
    ],

    title:String,
    buyer_message:String,
    pay_time:String,
    payment:Number,
    refunded_fee:Number,
    refund_state:String,
    type:String,
    status:String,
    update_time:String,
    receiver_mobile:String,
    receiver_name:String,
    total_fee:Number

}, {versionKey: false});

var wOrder = mongoose.model('wOrder', wOrderSchema,'wOrder');
module.exports = wOrder;
