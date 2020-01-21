const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let boxSchema = new Schema({
  name: { type: String, required: true, max: 100 },
  ownerEmail: { type: String, required: true },
  mealsIds: { type: [Number], default: undefined },
  description: { type: String, max: 100 }
});

// Export the model
module.exports = mongoose.model("box", boxSchema);
