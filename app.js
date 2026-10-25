require("dotenv").config();
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const connectDB = require("./config/db");
const app = express();
connectDB();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.SESSION_MONGO_URI, collectionName: "sessions"})
}));
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    // Az aktuális útvonal, pl. a menüben az aktív pont kiemeléséhez
    res.locals.currentPath = req.path;
    // Egyszer használatos (flash) üzenet: kiolvassuk, majd töröljük.
    // Csak akkor nyúlunk a sessionhöz, ha van üzenet, különben minden látogatónak
    // elmentődne egy üres session az adatbázisba (saveUninitialized: false ellenére).
    res.locals.message = req.session.message || "";
    if (req.session.message) { delete req.session.message; }
    next();
});
app.use("/", require("./routes/mainRouter"));       // Főoldal, autentikáció
app.use("/", require("./routes/messageRouter"));    // Kapcsolat, Üzenetek
app.use("/", require("./routes/dataRouter"));       // Adatbázis, Diagram
app.use("/crud", require("./routes/crudRouter"));   // CRUD (admin)
const port = process.env.PORT || 3000;
app.listen(port, () => {console.log(`Server: http://localhost:${port}`);});