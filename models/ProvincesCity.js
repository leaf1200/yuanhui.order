var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const moment = require('moment');

var provincesSchema = new Schema({
    ID:Number,
    Name:String,
    ParentID:Number,
    LevelNum:Number
}, {versionKey: false});

var wProvince = mongoose.model('wProvinces', provincesSchema,'wProvinces');
module.exports = wProvince;
