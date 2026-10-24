// Kapcsolat és Üzenetek menü ("A" társ)
const Message = require("../models/Message");

const renderKapcsolat = (res, values, errors, status = 200) =>
    res.status(status).render("kapcsolat", { title: "Kapcsolat", values, errors });

exports.kapcsolatGet = (req, res) => {
    // Bejelentkezett felhasználónál a név mezőt előre kitöltjük
    const nev = req.session.user ? req.session.user.username : "";
    renderKapcsolat(res, { nev, email: "", targy: "", uzenet: "" }, {});
};

exports.kapcsolatPost = async (req, res) => {
    const values = {
        nev: req.body.nev || "",
        email: req.body.email || "",
        targy: req.body.targy || "",
        uzenet: req.body.uzenet || ""
    };
    try {
        await Message.create({
            ...values,
            felhasznalo: req.session.user ? req.session.user.id : null
        });
    } catch (err) {
        // Szerver oldali validáció: hibánál újra az űrlap, a beírt adatokkal és mezőnkénti hibákkal
        if (err.name === "ValidationError") {
            const errors = {};
            for (const field in err.errors) { errors[field] = err.errors[field].message; }
            return renderKapcsolat(res, values, errors, 400);
        }
        throw err;
    }
    // Post/Redirect/Get: frissítéskor ne küldje el újra az űrlapot
    req.session.message = "Köszönjük, az üzenetedet elküldtük!";
    res.redirect("/kapcsolat");
};

exports.uzenetekIndex = (req, res) => { res.render("placeholder", { title: "Üzenetek" }); };
