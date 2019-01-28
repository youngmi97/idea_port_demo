module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        } 
        req.flash('error_msg', 'Not Authroized');
        res.redirect('/users/login');
    }
}