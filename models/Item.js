const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let itemchema = new Schema({
  user: { type: String },
  items: { type: [] },
});

module.exports = mongoose.model("items", itemchema);
