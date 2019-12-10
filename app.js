const bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
mongoose = require("mongoose"),
dotenv = require("dotenv"),
express = require("express"),
ejs = require("ejs"),
app = express();
dotenv.config();

//APP CONFIG 

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
 
//MONGOOSE SCHEMA/MODEL CONFIG
const blogSchema = {
  title: String,
  image: String,
  body: String,
  created: {type: Date, default: Date.now}
};

const Blog = mongoose.model("Blog", blogSchema);

/*
Blog.create({
  title: "Test Blog", 
  image: "https://images.pexels.com/photos/356378/pexels-photo-356378.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500", 
  body: "This is a dog that i like."
});
*/

//RESTFUL ROUTES
app.get("/", function(req, res){
  res.redirect("/blogs");
});


//INDEX ROUTE
app.get("/blogs", function(req, res){

  //retrive all the blogs from db 
  Blog.find({}, function(err, blogs){
    if(err){
      console.log("err");
    }else{
      res.render("index", {blogs: blogs});
    }
  });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
  res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res){

  //create blog 
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog){
    if(err){
      res.render("new");
    }else{

      //then redirect to the index
      res.redirect("/blogs");
    }
  });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      res.render("show", {blog: foundBlog});
    }
  });
});

//EDIT ROUTE 
app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      res.render("edit", {blog: foundBlog});
    }
  });
});

//UPDATE ROUTE 
app.put("/blogs/:id", function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body); 
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){

  //destroy blog 
  Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/blogs");
    }else{
      res.redirect("/blogs");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server has started successfully");
});