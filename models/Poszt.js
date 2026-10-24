const mongoose = require("mongoose");
const posztSchema = new mongoose.Schema({
    nev: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("Poszt", posztSchema, "poszt");
