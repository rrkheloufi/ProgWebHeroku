const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let mealStatSchema = new Schema({
    mealId: { type: Number, default: undefined },
    totalComments: { type: Number, default: undefined },
    sumStars: { type: Number, default: undefined },
});

// Export the model
module.exports = mongoose.model("mealstat", mealStatSchema);