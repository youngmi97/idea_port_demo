const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

//use of destructuring
const {ensureAuthenticated} = require('../helpers/auth');


//load idea model
require('../models/Idea');
const Idea = mongoose.model('ideas');





//Idea index page
router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({user: req.user.id})
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
});


//Edit Idea form
router.get('/edit/:id', ensureAuthenticated,  (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            if (idea.user != req.user.id){
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/ideas');
            } else {
                res.render("ideas/edit", {
                    idea: idea
                });
            }
        });
    //res.render('ideas/edit');
});

//Add Idea form
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
});



//Process Form - for Add
router.post('/', ensureAuthenticated, (req, res) => {
    //console.log(req.body);
    //res.send('ok');

    let errors = [];

    if (!req.body.title) {
        errors.push({ text: "Please add a title" });
    }
    if (!req.body.details) {
        errors.push({ text: "Please add some details!" });
    }

    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        //res.send('passed');
        const newIdea = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newIdea).save().then(idea => {
            req.flash("success_msg", "An Idea has been added!");
            res.redirect('/ideas');
        })
    }
});


//get --> going to the webpage , clicking on url
//post --> webform, adding a request
//put --> update a resource on the server

//Edit form process
router.put('/:id', ensureAuthenticated, (req, res) => { //semi colon denotes a parameter
    //res.send('PUT');
    Idea.findOne({
        _id: req.params.id
    })
        .then(idea => {
            //new values
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save()
                .then(idea => {
                    req.flash("success_msg", "An Idea has successfully been Updated!");
                    res.redirect('/ideas');
                })
        });
});

//Delete Idea route
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.deleteOne({ _id: req.params.id })
        .then(() => {
            req.flash('success_msg', 'An Idea has successfully been removed');
            res.redirect('/ideas');
        });
});



//exporting it to make it accessible from other directories 
module.exports = router;