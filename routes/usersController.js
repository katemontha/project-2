var express = require('express');
var dialogs = require('dialogs');
var router = express.Router();

var User = require("../models/user");
var Item = require("../models/item");

// USERS INDEX ROUTE
router.get('/', function (request, response) {

    // find all of the users
    User.find({})
        .exec(function (error, userList) {
            if (error) {
                console.log("Error while retrieving users: " + error);
                return;
            }

            // then pass the list of users to Handlebars to render
            response.render('users/index', {
                userList: userList
            });
        })
})

// USER CREATE FORM
router.get('/new', function (request, response) {
    response.render('users/new');
});

// USER CREATE ROUTE
router.post('/', function (request, response) {

    // get info from new user form
    var newUserFromForm = request.body;

    // apply to user model from schema
    var user = new User({
        first_name: newUserFromForm.first_name,
        last_name: newUserFromForm.last_name,
        email: newUserFromForm.email
    });

    // save the new user to the database
    user.save(function (err, user) {
        if (err) {
            console.log(err);
            return;
        }

        // once the new user has been saved, redirect to the users index page
        response.redirect('/');
    });
});

// USER SHOW ROUTE
router.get('/:id', function (request, response) {

    // get selected user id
    var userId = request.params.id;

    // find user in database with id
    User.findById(userId)
        .exec(function (error, user) {
            if (error) {
                console.log("Error while retrieving user with ID of " + userId);
                console.log("Error message: " + error);
                return;
            }
            response.render('users/show', {
                user: user
            });
        });
});


// USER EDIT ROUTE
router.get('/edit/:id', function (request, response) {
    var userId = request.params.id;
    User.findById(userId)
        .exec(function (error, user) {
            if (error) {
                console.log("Error while retrieving user with ID of " + userId);
                console.log("Error message: " + error);
                return;
            }

            // pass user info to edit form
            response.render('users/edit', {
                user: user
            });
        });
});

// USER UPDATE ROUTE
router.put('/:id', function (request, response) {
    var userId = request.params.id;
    var newUserInfo = request.body;

    // find user and update database with new info from edit form
    User.findByIdAndUpdate(userId, newUserInfo, { new: true })
        .exec(function (error, user) {

            if (error) {
                console.log("Error while updating User with ID of " + userId);
                return;
            }

            // redirect to show new info after hitting submit
            response.redirect('/users/' + userId);

        });

});

// USER DELETE
router.get('/delete/:id', function (request, response) {
    var userId = request.params.id;

    // then find and delete the user by id number
    User.findByIdAndRemove(userId)
        .exec(function (error, user) {
            if (error) {
                console.log("Error while deleting User with ID of " + userId);
                return;
            }
            response.redirect('/users');

        });
});

// SHOW NEW ITEM FORM
router.get('/:userId/items/new', function (request, response) {
    var userId = request.params.userId;

    // pass user id to rendered new item form
    response.render('items/new', {
        userId: userId
    });
});

// ADD A NEW ITEM
router.post('/:userId/items', function (request, response) {
    var userId = request.params.userId;

    // request new item that was created with new item form
    var newItemName = request.body.name;

    // find user that the new item was created for
    User.findById(userId)
        .exec(function (err, user) {

            // add new item to list
            user.items.push(new Item({ name: newItemName }));

            // save user info to database
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    return;
                }

                // redirect to user show page
                response.redirect('/users/' + userId);
            });
        });
});

// REMOVE AN ITEM
router.get('/:userId/items/:itemId/delete', function (request, response) {
    // grab the ID of the User we would like to delete an item for
    var userId = request.params.userId;

    // grab the ID of the Item we would like to delete for the User ID above
    var itemId = request.params.itemId;

    // use Mongoose to find the User by its ID and delete the Item
    // that matches our Item ID
      User.findByIdAndUpdate(userId, {
          $pull: {
              items: { _id: itemId }
          }
      })
          .exec(function (err, item) {
              if (err) {
                  console.log(err);
                  return;
              }

              // once we have deleted the item, redirect to the user's show page
              response.redirect('/users/' + userId);
        })
});

// SHOW THE ITEM EDIT FORM
router.get('/:userId/items/:itemId/edit', function (request, response) {

    // grab the ID of the user whose Item we would like to edit
    var userId = request.params.userId;

    // then grab the ID of the Item we would like to edit for the User above
    var itemId = request.params.itemId;

    // find the User by ID
    User.findById(userId)
        .exec(function (error, user) {

            // once we have found the User, find the Item in its' array
            // of items that matches the Item ID above
            var itemToEdit = user.items.find(function (item) {
                return item.id === itemId;
            })

            // Once we have found the item we would like to edit, render the
            // Item edit form with all of the information we would like to put
            // into the form
            response.render('items/edit', {
                userId: userId,
                itemId: itemId,
                itemToEdit: itemToEdit
            })
        })

});

// EDIT AN ITEM
router.put('/:userId/items/:itemId', function (request, response) {

    // find the ID of the user we would like to edit
    var userId = request.params.userId;

    // find the ID of the Item we would like to edit for the User above
    var itemId = request.params.itemId;

    // grab the edited information about the Item from the form
    var editedItemFromForm = request.body;

    // find the User by ID
    User.findById(userId)
        .exec(function (error, user) {

            // once we have found the User, find the Item in that user's
            // collection of Items that matches our Item ID above
            var itemToEdit = user.items.find(function (item) {
                return item.id === itemId;
            })

            // update the item we would like to edit with the new
            // information from the form
            itemToEdit.name = editedItemFromForm.name;

            // once we have edited the Item, save the user to the database
            user.save(function (error, user) {

                // Once we have saved the user with its edited Item, redirect
                // to the show page for that User. We should see the Item
                // information updated.
                response.redirect('/users/' + userId)
            });


        });
});

module.exports = router;
