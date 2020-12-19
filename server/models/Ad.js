const mongoose = require("mongoose");

//Creates the RoomSchema and exports it
const AdSchema = new mongoose.Schema({
    linkUrl: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  }
});

const Ad = mongoose.model("Ad", AdSchema);

module.exports = Ad;