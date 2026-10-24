const mongoose = require("mongoose");
const labdarugoSchema = new mongoose.Schema({
    mezszam: { type: Number, required: true, min: 1, max: 99 },
    klub: { type: mongoose.Schema.Types.ObjectId, ref: "Klub", required: true },
    poszt: { type: mongoose.Schema.Types.ObjectId, ref: "Poszt", required: true },
    // Felvett név esetén üres lehet (pl. csak "Leandro")
    utonev: { type: String, default: "" },
    vezeteknev: { type: String, required: true },
    szulido: { type: Date, required: true },
    magyar: { type: Boolean, default: false },
    kulfoldi: { type: Boolean, default: false },
    // Euróezerben
    ertek: { type: Number, required: true, min: 0 }
});
module.exports = mongoose.model("Labdarugo", labdarugoSchema, "labdarugo");
