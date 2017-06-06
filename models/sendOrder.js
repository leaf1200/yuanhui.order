var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var wsendOrderSchema = new Schema({
      cellphone: String,
      ordercode:String,
      productname:String,
      series:String, //'LF/AMN/GC选一填入',
      stage:String, //'1段/2段/3段/4段/5段',
      specifications:String, //'XXG：如400G,850G等',
      name:String,
      province:Number,
      city:Number,
      area:Number,
      township:Number,
      orderstatus:String,
      address:String,
      skuid:String,
      skunum:String,
      skumoney:String,
      ordermoney:String,
      backmoney:String,
      gettype:String,
      source:String,
      retcode:Number,
      msg:String,
      created: {
        type: String,
        default: () => {
            return moment().format('YYYY-MM-DD HH:mm:ss')
        }
    },


}, {versionKey: false});

var wsendOrder = mongoose.model('wsendOrder', wsendOrderSchema,'wsendOrder');
module.exports = wsendOrder;
