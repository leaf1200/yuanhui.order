const wUser = require('../models/wuser.js');
const Promise = require('promise');

var UserSvc = function(api) {
  this.api = api;
};

UserSvc.prototype.subscribe = function(openId, parent, child) {
    return new Promise((resolve, reject) => {
        var u = new wUser();
        u.openId = openId;
        u.from = {
            parent: parent,
            child: child
        };
        u.save(err => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
};

UserSvc.prototype.unsubscribe = function(openId) {
    return new Promise((resolve, reject) => {
        wUser.findOneAndRemove({openId: openId}).then(() => {
            return resolve();
        }).catch(err => {
            return reject(err);
        });
    });
};

UserSvc.prototype.getProfile = function(openId) {
  return new Promise((resolve, reject) => {
    console.log(openId);
    this.api.getUser(openId, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    })
  });
};

module.exports = UserSvc;
