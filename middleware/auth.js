// Csak bejelentkezett felhasználó (user vagy admin) érheti el
exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) { return next(); }
    res.redirect("/login");
};

// Csak admin érheti el
exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") { return next(); }
    res.redirect("/");
};
