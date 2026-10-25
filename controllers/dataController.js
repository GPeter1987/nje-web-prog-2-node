const Klub = require("../models/Klub");
const Poszt = require("../models/Poszt");
const Labdarugo = require("../models/Labdarugo");

// Adatbázis és Diagram menü ("B" társ)
exports.adatbazisIndex = async (req, res) => {
    try {
        const klubok = await Klub.find().sort({ csapatnev: 1 });
        const posztok = await Poszt.find().sort({ nev: 1 });

        const labdarugok = await Labdarugo.find()
            .populate("klub")
            .populate("poszt")
            .sort({ vezeteknev: 1, utonev: 1 });

        res.render("adatbazis", {
            title: "Adatbázis",
            klubok,
            posztok,
            labdarugok
        });

    } catch (err) {
        console.error("Adatbázis lekérdezési hiba:", err);
        res.status(500).send("Hiba történt az adatok lekérdezésekor.");
    }
};

exports.diagramIndex = (req, res) => { res.render("placeholder", { title: "Diagram" }); };
