var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/project-2');

var User = require('../models/user');
var Item = require('../models/item');

// Use native promises
mongoose.Promise = global.Promise;

// First we clear the database of existing users and items.
Item.remove({}, function(err){
  console.log(err);
});

User.remove({}, function(err){
  console.log(err);
});

// create new users
var kate = new User({
  first_name: 'Kate',
  email: 'katemontha@gmail.com',
  item: [{name: "You're my favorite. Cheer up!"}]
});



// save the users
kate.save(function(err) {
  if (err) console.log(err);

  console.log('User created!');
});
