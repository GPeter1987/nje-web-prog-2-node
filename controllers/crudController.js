const mongoose = require("mongoose");
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

// UPDATE - Szerkesztési űrlap megjelenítése
exports.editGet = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).send("Érvénytelen labdarúgó-azonosító.");
        }

        const labdarugo = await Labdarugo.findById(id);

        if (!labdarugo) {
            return res.status(404).send("A labdarúgó nem található.");
        }

        const klubok = await Klub.find().sort({ csapatnev: 1 });
        const posztok = await Poszt.find().sort({ nev: 1 });

        return res.render("crud/edit", {
            title: "Labdarúgó szerkesztése",
            labdarugo,
            klubok,
            posztok,
            hibak: [],
            adatok: {
                mezszam: labdarugo.mezszam,
                vezeteknev: labdarugo.vezeteknev,
                utonev: labdarugo.utonev,
                klub: String(labdarugo.klub),
                poszt: String(labdarugo.poszt),
                szulido: labdarugo.szulido.toISOString().slice(0, 10),
                magyar: labdarugo.magyar ? "on" : undefined,
                kulfoldi: labdarugo.kulfoldi ? "on" : undefined,
                ertek: labdarugo.ertek
            },
            szabalyok: LabdarugoRequest.getSzabalyok(),
            datumHatarok: LabdarugoRequest.getSzuletesiDatumHatarok()
        });

    } catch (err) {
        console.error("Edit űrlap betöltési hiba:", err);

        return res.status(500).send(
            "Hiba történt a szerkesztési űrlap betöltésekor."
        );
    }
};

// UPDATE - Módosított labdarúgó mentése
exports.editPost = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).send("Érvénytelen labdarúgó-azonosító.");
        }

        const labdarugo = await Labdarugo.findById(id);

        if (!labdarugo) {
            return res.status(404).send("A labdarúgó nem található.");
        }

        const eredmeny = await LabdarugoRequest.validate(req.body);

        if (!eredmeny.valid) {
            const klubok = await Klub.find().sort({ csapatnev: 1 });
            const posztok = await Poszt.find().sort({ nev: 1 });

            return res.status(400).render("crud/edit", {
                title: "Labdarúgó szerkesztése",
                labdarugo,
                klubok,
                posztok,
                hibak: eredmeny.hibak,
                adatok: req.body,
                szabalyok: LabdarugoRequest.getSzabalyok(),
                datumHatarok: LabdarugoRequest.getSzuletesiDatumHatarok()
            });
        }

        await Labdarugo.findByIdAndUpdate(
            id,
            { $set: eredmeny.adatok },
            { runValidators: true }
        );

        return res.redirect("/crud");

    } catch (err) {
        console.error("Edit mentési hiba:", err);

        return res.status(500).send(
            "Hiba történt a labdarúgó módosításakor."
        );
    }
};

// DELETE - Labdarúgó törlése
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        // MongoDB azonosító ellenőrzése
        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).send(
                "Érvénytelen labdarúgó-azonosító."
            );
        }

        // Labdarúgó törlése az adatbázisból
        const labdarugo = await Labdarugo.findByIdAndDelete(id);

        // Nem létező labdarúgó kezelése
        if (!labdarugo) {
            return res.status(404).send(
                "A labdarúgó nem található."
            );
        }

        // Sikeres törlés után visszairányítás
        return res.redirect("/crud");

    } catch (err) {
        console.error("Delete hiba:", err);

        return res.status(500).send(
            "Hiba történt a labdarúgó törlésekor."
        );
    }
};
