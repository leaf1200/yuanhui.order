var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var wProductsSchema = new Schema({
    skuid: String,
    series:String,
    stage:String,
    specifications:String,
    created: {
        type: String,
        default: () => {
            return moment().format('YYYY-MM-DD HH:mm:ss')
        }
    }

}, {versionKey: false});

var wProducts = mongoose.model('wProducts', wProductsSchema,'wProducts');
module.exports = wProducts;
