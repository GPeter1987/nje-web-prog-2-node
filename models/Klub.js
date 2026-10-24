const mongoose = require("mongoose");
const klubSchema = new mongoose.Schema({
    csapatnev: { type: String, required: true, unique: true }
});
module.exports = mongoose.model("Klub", klubSchema, "klub");
