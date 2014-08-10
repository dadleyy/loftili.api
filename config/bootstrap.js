module.exports.bootstrap = function(cb) {

  function added(err, user) {
    if(err) 
      cb(err);

    sails.log(user);

    cb();
  }

  var danny = User.create({
    email: 'danny@dadleyy.com',
    password: 'password',
    first_name: 'danny',
    last_name: 'hadley'
  }, added);

};
