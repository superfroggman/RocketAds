const mongoose = require("mongoose");
mongoose.set('useCreateIndex', true); 
//Creates the RoomSchema and exports it
const AdSchema = new mongoose.Schema({
  linkUrl: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
});

const Ad = mongoose.model("Ad", AdSchema);

module.exports = Ad;
