const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Box = require("./database/models/box.model");
const Comment = require("./database/models/comment.model");
const MealStat = require("./database/models/mealstat.model");

var app = express();
let port = process.env.PORT || 8081;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", ["http://localhost:5000"]); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var mongooseOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let databaseName = "progWeb";
let url = "mongodb://localhost:27017/" + databaseName;
mongoose.connect(url, mongooseOptions);

const db = mongoose.connection;
db.once("open", _ => {
  console.log("Database connected:", url);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/box", async (request, response) => {
  try {
    var box = new Box(request.body);
    var result = await box.save();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/comment", async (request, response) => {
  try {
    let comment = new Comment(request.body);
    var result = await comment.save();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.put("/stat/:mealId", async (request, response) => {
  try {
    var stat = await MealStat.findOne({ mealId: request.params.mealId }).exec();
    if (stat) stat.set(request.body);
    else stat = new MealStat(request.body);
    var result = await stat.save();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/boxes", async (request, response) => {
  try {
    var result = await Box.find({
      ownerEmail: request.query.ownerEmail
    }).exec();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/boxes/search", async (request, response) => {
  try {
    let search = request.query.search;
    var result = await Box.find({
      name: { $regex: new RegExp(".*" + search + ".*", "i") }
    })
      .limit(20)
      .exec();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/box/:id", async (request, response) => {
  try {
    var box = await Box.findById(request.params.id).exec();
    response.send(box);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/comments/:mId", async (request, response) => {
  try {
    let comments = await Comment.find({ mealId: request.params.mId })
      .sort({ _id: -1 })
      .exec();
    response.send(comments);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.get("/mealStats/:mId", async (request, response) => {
  try {
    let mealStats = await MealStat.findOne({
      mealId: request.params.mId
    }).exec();
    response.send(mealStats);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.put("/box/:id", async (request, response) => {
  try {
    var box = await Box.findById(request.params.id).exec();
    box.set(request.body);
    var result = await box.save();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete("/box/:id", async (request, response) => {
  try {
    var result = await Box.deleteOne({ _id: request.params.id }).exec();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.delete("/comment/:id", async (request, response) => {
  try {
    var result = await Comment.deleteOne({ _id: request.params.id }).exec();
    response.send(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log("Server is up and running on port number " + port);
});
