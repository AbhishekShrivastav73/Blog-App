const express = require("express");
const app = express();
const mongooseconnection = require("./config/mongoose");
const userModel = require("./models/users");
const postModel = require("./models/posts");
const marked = require('marked');

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("signup");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/home/:name", async function (req, res) {
  let user = await userModel.findOne({ name: req.params.name });
  let posts = await postModel.find().populate("author");

  res.render("home", { user: user, posts: posts });
});
app.get("/home/:name/myposts", async function (req, res) {
  let user = await userModel.findOne({ name: req.params.name }).populate('posts');
//   let posts = user.populate('posts');
// res.send(user);
  res.render("mypost", { user: user, });
});



app.get("/home/:name/posts/:postId", async function (req, res) {
  try {
    // Find user by name
    let user = await userModel.findOne({ name: req.params.name });
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Find post by postId and populate both the author and the user for each comment
    let post = await postModel.findById(req.params.postId)
      .populate("author") // Populates the author of the post
      .populate({
        path: 'comments.user', // Populates the user for each comment
        model: 'User'
      });

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Convert Markdown content to HTML
    

    // Render the post view with user and post data
    res.render("post", { user: user, post: post,  });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



app.get('/:user/post/create',async function (req, res) {
  let user = await userModel.findOne({name : req.params.user});
  if (!user) {
    return res.status(404).send("User not found");
  }
  res.render('createPost', { user : user});
})

///------------------------------

app.post("/createUser", async function (req, res) {
  let createdUser = await userModel.create({
    name: req.body.name,
    password: req.body.password,
  });
  //   res.send(createdUser);

  res.redirect("/login");
});

app.post("/login", async function (req, res) {
  let user = await userModel.findOne({ name: req.body.name });
  if (!user || user.password !== req.body.password) {
    return res.status(401).send({ message: "Invalid username or password" });
  } else {
    res.redirect(`/home/${user.name}`);
  }
});

app.get("/users", async function (req, res) {
  let users = await userModel.find();
  res.send(users);
});

app.post("/:username/post/create", async function (req, res) {
  let user = await userModel.findOne({ name: req.params.username });

  let post = await postModel.create({
    title: req.body.title,
    content: req.body.content,
    author: user._id,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect(`/home/${user.name}/myposts`);
});

app.post("/:username/post/:postId/comment", async function (req, res) {
  let user = await userModel.findOne({ name: req.params.username });
  let post = await postModel.findById(req.params.postId);

  if (!user ||!post) {
    return res.status(404).send("User or post not found");
  }
  let comment = await postModel.findByIdAndUpdate(
    req.params.postId,
    { $push: { comments: { user: user._id, comment: req.body.comment } } },
    { new: true }
  );
  res.redirect(`/home/${user.name}/posts/${req.params.postId}`);
})


app.listen(3000);
