const mongoose = require("mongoose");

// A Kapcsolat űrlapon küldött üzenet. A szerver oldali validációt a séma végzi
// (a jegyzet 06b/2 mintája szerint), a controller a ValidationError-t jeleníti meg.
const messageSchema = new mongoose.Schema({
    nev: {
        type: String,
        trim: true,
        required: [true, "A név megadása kötelező."],
        minlength: [2, "A név legalább 2 karakter legyen."],
        maxlength: [60, "A név legfeljebb 60 karakter lehet."]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Az e-mail cím megadása kötelező."],
        maxlength: [100, "Az e-mail cím legfeljebb 100 karakter lehet."],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Érvényes e-mail címet adj meg (pl. nev@pelda.hu)."]
    },
    targy: {
        type: String,
        trim: true,
        required: [true, "A tárgy megadása kötelező."],
        minlength: [3, "A tárgy legalább 3 karakter legyen."],
        maxlength: [100, "A tárgy legfeljebb 100 karakter lehet."]
    },
    uzenet: {
        type: String,
        trim: true,
        required: [true, "Az üzenet megadása kötelező."],
        minlength: [10, "Az üzenet legalább 10 karakter legyen."],
        maxlength: [2000, "Az üzenet legfeljebb 2000 karakter lehet."]
    },
    // Ha bejelentkezett felhasználó küldte, ki volt az (látogatónál üres)
    felhasznalo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, {
    // createdAt = a küldés ideje (az Üzenetek menü ez alapján rendez)
    timestamps: true
});

module.exports = mongoose.model("Message", messageSchema);
