
const mongoose = require("mongoose");

const Klub = require("../models/Klub");
const Poszt = require("../models/Poszt");

class LabdarugoRequest {

    // A mezők megengedett értékei
    static getSzabalyok() {
        return {
            mezszamMin: 1,
            mezszamMax: 99,
            ertekMin: 0,
            ertekMax: 100000,
            minimumEletkor: 15,
            maximumEletkor: 50
        };
    }

    // Dátum formázása YYYY-MM-DD alakra
    static datumFormatum(datum) {
        const ev = datum.getFullYear();
        const honap = String(datum.getMonth() + 1).padStart(2, "0");
        const nap = String(datum.getDate()).padStart(2, "0");

        return `${ev}-${honap}-${nap}`;
    }

    // Születési dátum megengedett határai
    static getSzuletesiDatumHatarok() {
        const szabalyok = this.getSzabalyok();
        const ma = new Date();

        const minimum = new Date(
            ma.getFullYear() - szabalyok.maximumEletkor,
            ma.getMonth(),
            ma.getDate()
        );

        const maximum = new Date(
            ma.getFullYear() - szabalyok.minimumEletkor,
            ma.getMonth(),
            ma.getDate()
        );

        return {
            min: this.datumFormatum(minimum),
            max: this.datumFormatum(maximum)
        };
    }

    // Labdarúgó adatainak validálása
    static async validate(adatok) {
        const hibak = [];
        const tisztitottAdatok = {};

        const szabalyok = this.getSzabalyok();
        const datumHatarok = this.getSzuletesiDatumHatarok();

        // Vezetéknév
        const vezeteknev = String(adatok.vezeteknev || "").trim();

        if (!vezeteknev) {
            hibak.push("A vezetéknév megadása kötelező.");
        }

        tisztitottAdatok.vezeteknev = vezeteknev;

        // Utónév
        const utonev = String(adatok.utonev || "").trim();

        if (!utonev) {
            hibak.push("Az utónév megadása kötelező.");
        }

        tisztitottAdatok.utonev = utonev;

        // Mezszám
        const mezszamSzoveg = String(adatok.mezszam ?? "").trim();
        const mezszam = Number(mezszamSzoveg);

        if (
            !mezszamSzoveg ||
            !Number.isInteger(mezszam) ||
            mezszam < szabalyok.mezszamMin ||
            mezszam > szabalyok.mezszamMax
        ) {
            hibak.push(
                `A mezszám ${szabalyok.mezszamMin} és ${szabalyok.mezszamMax} közötti egész szám lehet.`
            );
        }

        tisztitottAdatok.mezszam = mezszam;

        // Születési dátum
        const szulidoSzoveg = String(adatok.szulido || "").trim();
        const szulido = new Date(szulidoSzoveg);

        const ervenyesDatum =
            /^\d{4}-\d{2}-\d{2}$/.test(szulidoSzoveg) &&
            !Number.isNaN(szulido.getTime()) &&
            szulido.toISOString().slice(0, 10) === szulidoSzoveg;

        if (
            !ervenyesDatum ||
            szulidoSzoveg < datumHatarok.min ||
            szulidoSzoveg > datumHatarok.max
        ) {
            hibak.push(
                `A labdarúgó életkora ${szabalyok.minimumEletkor} és ${szabalyok.maximumEletkor} év között lehet.`
            );
        }

        if (ervenyesDatum) {
            tisztitottAdatok.szulido = szulido;
        }

        // Klub
        if (
            !mongoose.isValidObjectId(adatok.klub) ||
            !await Klub.exists({ _id: adatok.klub })
        ) {
            hibak.push("Érvényes klubot kell választani.");
        } else {
            tisztitottAdatok.klub = adatok.klub;
        }

        // Poszt
        if (
            !mongoose.isValidObjectId(adatok.poszt) ||
            !await Poszt.exists({ _id: adatok.poszt })
        ) {
            hibak.push("Érvényes posztot kell választani.");
        } else {
            tisztitottAdatok.poszt = adatok.poszt;
        }

        // Játékos értéke (ezer euró)
        const ertekSzoveg = String(adatok.ertek ?? "").trim();
        const ertek = Number(ertekSzoveg);

        if (
            !ertekSzoveg ||
            !Number.isInteger(ertek) ||
            ertek < szabalyok.ertekMin ||
            ertek > szabalyok.ertekMax
        ) {
            hibak.push(
                `Az érték ${szabalyok.ertekMin} és ${szabalyok.ertekMax} közötti egész szám lehet.`
            );
        }

        tisztitottAdatok.ertek = ertek;

        // Magyar / külföldi
        const magyar = adatok.magyar === "on";
        const kulfoldi = adatok.kulfoldi === "on";

        if (magyar === kulfoldi) {
            hibak.push(
                "Pontosan egy állampolgársági kategóriát kell választani."
            );
        }

        tisztitottAdatok.magyar = magyar;
        tisztitottAdatok.kulfoldi = kulfoldi;

        return {
            valid: hibak.length === 0,
            hibak,
            adatok: tisztitottAdatok
        };
    }
}

module.exports = LabdarugoRequest;
