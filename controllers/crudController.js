
const Labdarugo = require("../models/Labdarugo");
const Klub = require("../models/Klub");
const Poszt = require("../models/Poszt");
const LabdarugoRequest = require("../requests/LabdarugoRequest");

// READ - Labdarúgók listázása
exports.index = async (req, res) => {
    try {
        const labdarugok = await Labdarugo.find()
            .populate("klub")
            .populate("poszt")
            .sort({ vezeteknev: 1, utonev: 1 });

        res.render("crud/index", {
            title: "Labdarúgók kezelése",
            labdarugok
        });

    } catch (err) {
        console.error("CRUD listázási hiba:", err);

        return res.status(500).send(
            "Hiba történt a labdarúgók lekérdezésekor."
        );
    }
};

// CREATE - Új labdarúgó űrlap megjelenítése
exports.createGet = async (req, res) => {
    try {
        const klubok = await Klub.find().sort({ csapatnev: 1 });
        const posztok = await Poszt.find().sort({ nev: 1 });

        return res.render("crud/create", {
            title: "Új labdarúgó felvétele",
            klubok,
            posztok,
            hibak: [],
            adatok: {},

            // Validációs szabályok átadása az EJS-nek
            szabalyok: LabdarugoRequest.getSzabalyok(),
            datumHatarok: LabdarugoRequest.getSzuletesiDatumHatarok()
        });

    } catch (err) {
        console.error("Create űrlap betöltési hiba:", err);

        return res.status(500).send(
            "Hiba történt az űrlap betöltésekor."
        );
    }
};

// CREATE - Új labdarúgó mentése
exports.createPost = async (req, res) => {
    try {
        // Adatok ellenőrzése a Request osztállyal
        const eredmeny = await LabdarugoRequest.validate(req.body);

        // Hibás adatok esetén újra megjelenítjük az űrlapot
        if (!eredmeny.valid) {
            const klubok = await Klub.find().sort({ csapatnev: 1 });
            const posztok = await Poszt.find().sort({ nev: 1 });

            return res.status(400).render("crud/create", {
                title: "Új labdarúgó felvétele",
                klubok,
                posztok,
                hibak: eredmeny.hibak,
                adatok: req.body,

                // Validációs szabályok újbóli átadása
                szabalyok: LabdarugoRequest.getSzabalyok(),
                datumHatarok: LabdarugoRequest.getSzuletesiDatumHatarok()
            });
        }

        // Csak a validált adatokat mentjük az adatbázisba
        await Labdarugo.create(eredmeny.adatok);

        // Sikeres mentés után visszatérés a CRUD listához
        return res.redirect("/crud");

    } catch (err) {
        console.error("Create mentési hiba:", err);

        return res.status(500).send(
            "Hiba történt a labdarúgó mentésekor."
        );
    }
};
