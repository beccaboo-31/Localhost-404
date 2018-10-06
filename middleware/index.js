//Contains all the middleware
var Problem=require("../models/problem");
var Comment=require("../models/comment");
var middlewareObj={};

middlewareObj.checkProblemOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Problem.findById(req.params.id, function(err, foundProblem){
            if(err){
                req.flash("error", "Problem not found");
                res.redirect("back");
            } else {
                // Is Problem created by this user?
                if(foundProblem.issuer.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}


middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
           if(err){
               res.redirect("back");
           } else {
               //Does user own this comment
               if(foundComment.author.id.equals(req.user._id)){
                   next();
               }else{
                   req.flash("error", "You don't have permission to do that!");
                   res.redirect("back");
               }
           }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login_citizen");
};

module.exports = middlewareObj;

