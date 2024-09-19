const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: "string",
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  password: {
    type: "string",
    required: true,
    minlength: 8,
    maxlength: 100,
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model("User", userSchema);
