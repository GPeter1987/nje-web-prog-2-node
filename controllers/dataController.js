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

exports.diagramIndex = async (req, res) => {
    try {
        // Labdarúgók számának összesítése klubonként
        const eredmeny = await Labdarugo.aggregate([
            {
                $group: {
                    _id: "$klub",
                    letszam: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "klub",
                    localField: "_id",
                    foreignField: "_id",
                    as: "klubAdatok"
                }
            },
            { $unwind: "$klubAdatok" },
            { $sort: { "klubAdatok.csapatnev": 1 } },
            {
                $project: {
                    _id: 0,
                    klubNev: "$klubAdatok.csapatnev",
                    letszam: 1
                }
            }
        ]);

        res.render("diagram", {
            title: "Diagram",
            klubNevek: eredmeny.map(adat => adat.klubNev),
            letszamok: eredmeny.map(adat => adat.letszam)
        });

    } catch (err) {
        console.error("Diagram lekérdezési hiba:", err);
        res.status(500).send("Hiba történt a diagram adatainak lekérdezésekor.");
    }
};