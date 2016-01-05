var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI ||
                      process.env.MONGOHQ_URL || 
                      'mongodb://localhost/project-1' );

// After creating a new model, require and export it:
// module.exports.Tweet = require("./tweet.js");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("db is open for business");
});

module.exports.User = require('./user.js');


  