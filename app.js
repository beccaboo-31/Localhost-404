var express=require("express"),
    app=express(),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    // seedDB=require("./seeds"),
    flash=require("connect-flash"),
    methodOverride=require("method-override"),
    passport=require("passport"),
    localStrategy=require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose"),
    middleware=require("./middleware"),
    path=require("path"),
    crypto=require("crypto"),
    multer=require("multer"),
    gridFsStorage=require("multer-gridfs-storage"),
    grid=require("gridfs-stream");
    
// var geohash = require("geohash").GeoHash;
    
    
mongoose.connect("mongodb://localhost/hackathon_project");    


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//Schema Setup
var Comment=require("./models/comment");
var User=require("./models/user");
var Problem=require("./models/problem");
//var Image=require("./models/image");

//PASSPORT CONFIG
app.use(require("express-session")({
    secret: "It is a secret. Don't ask.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));  //Comes with passportLocalMongoose which we plugged in to User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Adds the req.user to every route (middleware) similarly flash message also tot every template
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error=req.flash("error");
   res.locals.success=req.flash("success");
   next();
});

//========================
//HOME Route
//========================

app.get("/",function(req,res){
	res.render("homepage");
});

//========================
//AUTH ROUTES
//========================

app.get("/register_citizen", function(req, res){
    res.render("register_citizen");
});

app.post("/register_citizen", function(req, res){
    var newUser= new User({username: req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register_citizen");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to VOM"+ user.username);
            res.redirect("/problems");
        });
    });
});

app.get("/register_ward", function(req, res){
    res.render("register_ward");
});

app.post("/register_ward", function(req, res){
    var newUser= new User({username: req.body.username, email: req.body.email, ward: req.body.ward});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register_ward");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to VOM"+ user.username);
            res.redirect("/problems");
        });
    });
});

//LOGIN Routes

//Show login_citizen Form
app.get("/login_citizen", function(req, res){
    res.render("login_citizen");
});

//Show login_ward Form
app.get("/login_ward", function(req, res){
    res.render("login_ward");
});

//Handling Login_citizen Logic
app.post("/login_citizen", passport.authenticate("local", {
    successRedirect: "/problems",
    failureRedirect: "/login_citizen"
}), function(req, res){
});


//Handling Login_ward Logic
app.post("/login_ward", passport.authenticate("local", {
    successRedirect: "/problems",
    failureRedirect: "/login_ward"
}), function(req, res){
});

//logout Route
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out");
    res.redirect("/problems");
});

//========================
//PROBLEM Routes
//========================

//INDEX - Display all problems
app.get("/problems", function(req, res){
    //Get all problems from DB
    Problem.find({},function(err, allProblems){
        if(err){
            console.log(err);
        }else{
          res.render("problems/index", {problems: allProblems}); 
        }
    });
    //console.log("Reached /problems");
});

//NEW - Display form to add new problem
app.get("/problems/create", middleware.isLoggedIn, function(req, res){
    res.render("problems/create");
    //console.log("Reached /problems/new");
});


//CREATE - add problem to DB
// var prob={
//     name: "Road Traffic",
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     type: "Road",
//     image: "https://images.unsplash.com/photo-1521060722990-50641f4bf465?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=80d5f4d0bee487fbe8995caf11aeee66&auto=format&fit=crop&w=500&q=60"
    
// };

// Problem.create(prob);

app.post("/problems", middleware.isLoggedIn, function(req, res){
    //get data from form and add to problems array
    //redirect to problems list page

    var name=req.body.fname;
    var image=req.body.fimage;
    var desc=req.body.fcontent;
    var type=req.body.ftype;
    var locality=req.body.floc;
    var ward=req.body.ward;
    var area=req.body.farea;
    var city="Mumbai";
    var geolocation= locality+",+"+area+",+"+city;
    
    var issuer={
        id: req.user._id,
        username: req.user.username
    };
    
    var newProblem={name: name, content: desc, issuer: issuer, type: type, geolocation: geolocation, image: image, locality: locality, area:area, ward:ward};
    
    //Create a new problem and save to DB
    Problem.create(newProblem, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            //Go back to problems page
            res.redirect("/problems");
        }
    });
});

// SHOW - shows more info about one campground
app.get("/problems/:id", function(req, res){
    //find the campground with provided ID
    Problem.findById(req.params.id).populate("comments").exec(function(err, foundProblem){
        if(err){
            res.send(err);
        } else {
            console.log(foundProblem.comments);
            //render show template with that problem
            res.render("problems/show", {problem: foundProblem});
        }
    });
});

//EDIT Problems
app.get("/problems/:id/edit", middleware.checkProblemOwnership, function(req, res){
        Problem.findById(req.params.id, function(err, foundProblem){
          res.render("problems/edit", {problem: foundProblem});
        });
});

//UPDATE Problem

app.put("/problems/:id", middleware.checkProblemOwnership, function(req, res){
    //find and update
    Problem.findByIdAndUpdate(req.params.id, req.body.problem, function(err, updatedProblem){
        if(err){
            res.redirect("/problems");
        }else{
            //redirect
            res.redirect("/problems/"+req.params.id);
        }
    });
});

//========================
//COMMENTS Routes
//========================

//CREATE - add comment to problem
app.get("/problems/:id/comments/new", middleware.isLoggedIn, function(req, res){
    // find problem by id
    console.log(req.params.id);
    Problem.findById(req.params.id, function(err, problem){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {problem: problem});
        }
    });
});

//Comments Create
app.post("/problems/:id/comments",middleware.isLoggedIn,function(req, res){
  //lookup problem using ID
  Problem.findById(req.params.id, function(err, problem){
      if(err){
          console.log(err);
          res.redirect("/problems");
      } else {
        Comment.create(req.body.comment, function(err, comment){
          if(err){
              req.flash("error", "Something went wrong");
              console.log(err);
          } else {
              //add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              //save comment
              comment.save();
              problem.comments.push(comment);
              console.log(comment);
              req.flash("success", "Successfully added comment");
              res.redirect('/problems/' + problem._id);
          }
        });
      }
  });
});

    
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server connected!");
});