const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let commentSchema = new Schema({
  ownerEmail: { type: String, required: true },
  mealId: { type: Number, default: undefined },
  stars: { type: Number, default: undefined },
  description: { type: String, max: 100 },
  title: { type: String, max: 50 }
});

// Export the model
module.exports = mongoose.model("comment", commentSchema);