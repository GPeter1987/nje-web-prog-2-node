const User = require("../models/User");
const Klub = require("../models/Klub");
const Labdarugo = require("../models/Labdarugo");
const bcrypt = require("bcrypt");

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 72; // a bcrypt csak az első 72 bájtot veszi figyelembe

// Főoldal: néhány élő adat az NB-1 adatbázisból a bemutatóhoz
exports.homeIndex = async (req, res) => {
    const [klubDb, jatekosDb, ertekOsszesites, legertekesebb] = await Promise.all([
        Klub.countDocuments(),
        Labdarugo.countDocuments(),
        Labdarugo.aggregate([{ $group: { _id: null, osszertek: { $sum: "$ertek" }, kulfoldi: { $sum: { $cond: ["$kulfoldi", 1, 0] } } } }]),
        Labdarugo.findOne().sort({ ertek: -1 }).populate("klub").lean()
    ]);
    const stats = {
        klubDb,
        jatekosDb,
        osszertek: ertekOsszesites.length ? ertekOsszesites[0].osszertek : 0, // euróezerben
        kulfoldiDb: ertekOsszesites.length ? ertekOsszesites[0].kulfoldi : 0,
        legertekesebb
    };
    res.render("home", { hero: true, stats });
};

// Szerver oldali validáció a regisztrációs űrlaphoz: hibaüzenetek tömbje (üres, ha minden rendben)
const validateRegistration = (username, password, passwordAgain) => {
    const errors = [];
    if (!username) {
        errors.push("A felhasználónév megadása kötelező.");
    } else if (username.length < User.USERNAME_MIN || username.length > User.USERNAME_MAX) {
        errors.push(`A felhasználónév ${User.USERNAME_MIN}–${User.USERNAME_MAX} karakter hosszú lehet.`);
    } else if (!User.USERNAME_PATTERN.test(username)) {
        errors.push("A felhasználónév csak betűket, számokat és a _ . - jeleket tartalmazhatja.");
    }
    if (!password) {
        errors.push("A jelszó megadása kötelező.");
    } else if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        errors.push(`A jelszó ${PASSWORD_MIN}–${PASSWORD_MAX} karakter hosszú lehet.`);
    } else if (password !== passwordAgain) {
        errors.push("A két jelszó nem egyezik.");
    }
    return errors;
};

exports.registerGet = (req, res) => {
    res.render("register", { title: "Regisztráció", errors: [], username: "" });
};
exports.registerPost = async (req, res) => {
    const username = (req.body.username || "").trim();
    const password = req.body.password || "";
    const passwordAgain = req.body.passwordAgain || "";

    // Hibás adatoknál nem irányítunk át, hanem újra megjelenítjük az űrlapot
    // a hibákkal és a beírt felhasználónévvel
    const renderErrors = (errors) =>
        res.status(400).render("register", { title: "Regisztráció", errors, username });

    const errors = validateRegistration(username, password, passwordAgain);
    if (errors.length > 0) { return renderErrors(errors); }

    if (await User.findOne({ username })) {
        return renderErrors(["Már van ilyen felhasználó, válassz másik felhasználónevet."]);
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, role: "user" });
    req.session.message = "Sikeres regisztráció! Most már bejelentkezhetsz.";
    res.redirect("/login");
};

exports.loginGet = (req, res) => {
    res.render("login", { title: "Bejelentkezés", username: "" });
};
exports.loginPost = async (req, res) => {
    const username = (req.body.username || "").trim();
    const password = req.body.password || "";
    const loginFailed = (text) =>
        res.status(400).render("login", { title: "Bejelentkezés", username, message: text });

    if (!username || !password) {
        return loginFailed("Add meg a felhasználónevet és a jelszót.");
    }
    const user = await User.findOne({ username });
    // Biztonsági okból nem áruljuk el, hogy a név vagy a jelszó volt-e hibás
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return loginFailed("Nem sikerült a bejelentkezés: hibás felhasználónév vagy jelszó.");
    }

    // Belépéskor új session-azonosítót kérünk (session fixation elleni védelem)
    req.session.regenerate((err) => {
        if (err) { return loginFailed("Nem sikerült a bejelentkezés, próbáld újra."); }
        req.session.user = { id: user._id, username: user.username, role: user.role };
        req.session.message = `Sikeres bejelentkezés. Üdv, ${user.username}!`;
        res.redirect("/");
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => { res.redirect("/"); });
};
