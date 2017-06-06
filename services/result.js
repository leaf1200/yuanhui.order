var Result = function(error, data) {
    this.data = data;
    this.code = error.code;
    this.message = error.message;
}
module.exports = Result;
