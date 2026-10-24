// Az NB-1 adatbázis betöltése a data/ mappából: npm run seed
// Előbb törli a három kollekciót, így többször is futtatható.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Klub = require("./models/Klub");
const Poszt = require("./models/Poszt");
const Labdarugo = require("./models/Labdarugo");

// Tabulátorral tagolt fájl => objektumok tömbje (az első sor a fejléc)
const readTable = (file) => {
    const lines = fs.readFileSync(path.join(__dirname, "data", file), "utf8")
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");
    const header = lines[0].split("\t");
    return lines.slice(1).map(line => {
        const values = line.split("\t");
        const row = {};
        header.forEach((col, i) => { row[col] = (values[i] || "").trim(); });
        return row;
    });
};

// "1997.01.23" => Date (UTC éjfél, hogy ne csússzon el a nap)
const parseDate = (text) => {
    const [y, m, d] = text.split(".").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
};

// Access-stílusú logikai érték: -1 = igaz, 0 = hamis
const parseBool = (text) => text === "-1";

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB is connected.");

    await Promise.all([Klub.deleteMany({}), Poszt.deleteMany({}), Labdarugo.deleteMany({})]);

    // Régi szám id => új MongoDB _id, a labdarúgók hivatkozásaihoz
    const klubIds = {};
    for (const row of readTable("klub.txt")) {
        const klub = await Klub.create({ csapatnev: row.csapatnev });
        klubIds[row.id] = klub._id;
    }
    const posztIds = {};
    for (const row of readTable("poszt.txt")) {
        const poszt = await Poszt.create({ nev: row.nev });
        posztIds[row.id] = poszt._id;
    }

    const labdarugok = readTable("labdarugo.txt").map(row => ({
        mezszam: Number(row.mezszam),
        klub: klubIds[row.klubid],
        poszt: posztIds[row.posztid],
        utonev: row.utonev,
        vezeteknev: row.vezeteknev,
        szulido: parseDate(row.szulido),
        magyar: parseBool(row.magyar),
        kulfoldi: parseBool(row.kulfoldi),
        ertek: Number(row.ertek)
    }));
    await Labdarugo.insertMany(labdarugok);

    console.log(`Klub: ${await Klub.countDocuments()}, Poszt: ${await Poszt.countDocuments()}, Labdarugo: ${await Labdarugo.countDocuments()}`);
    await mongoose.disconnect();
};

seed().catch(async (err) => {
    console.error("Seed error:", err.message);
    await mongoose.disconnect();
    process.exit(1);
});
