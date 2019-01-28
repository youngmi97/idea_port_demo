const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


const path = require('path');


//Load Routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

//Passport Config
require('./config/passport')(passport);

//initializes the application
const app = express();



//Map global promise
mongoose.Promise = global.Promise;





//Mongoose Middleware --> connect mongoose to db -> either local or mLab!
// mongoose.connect('mongodb://localhost/vidjot-dev', {
//     //useMongoClient: true
//     //not required in new mongoose version??
//     //useNewUrlParser: true
// })
//     .then(() => console.log('MongoDB Connected...'))
//     .catch(err => console.log(err));

mongoose.connect(
  "mongodb://localhost/vidjot-dev",
  { useNewUrlParser: true }
);
mongoose.connection
    .once('open', () => console.log('MongoDB connected...'))
    .on('error', (err) => {
        console.warn('Warning', err);
    });
//using a promise?




//Handlebars Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// telling the system that the handlebars template is being used

//Body Parser MiddleWare
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));
//__dirname represents the current directory
//this sets the public folder to be the express static folder

//Method-override middleware
app.use(methodOverride('_method'));

//Express-session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
}));


//Passport middleware --> must come after the express-session middleware
app.use(passport.initialize());
app.use(passport.session());


//Connect Flash middleware
app.use(flash());



//Global Variables - middleware
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    //sets a variable
    //whenever set for a success msg, it is placed into the success_msg variable
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    //req.user only exists when the user logs in, otherwise set to null
    res.locals.user = req.user || null;
    next();
    //next meaning we want to call the next piece of middleware
});



//How middleware works
// app.use(function (req, res, next){
//     //console.log(Date.now());
//     req.name = 'jae';
//     //making changes to the request object 
//     next();
//     //passes control to the next middleware function --> otherwise the request is left hanging(?)
// });

//Index Route
app.get('/', (req, res) => {
    const title ='Welcome';
    res.render('index', {
        title: title
    });
});


//About Route
app.get('/about', (req, res) => {
    res.render('about');
});



//Use Routes
app.use('/ideas', ideas);
app.use('/users', users);

//Modification for Heroku Deployment
const port = process.env.PORT || 5000;


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});