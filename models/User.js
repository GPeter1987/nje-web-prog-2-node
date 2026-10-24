const mongoose = require("mongoose");

// A felhasználónév szabályai (a controller is ezeket használja a validációhoz)
const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_PATTERN = /^[\p{L}\p{N}_.-]+$/u; // betűk (ékezetes is), számok, _ . -

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "A felhasználónév megadása kötelező."],
        minlength: [USERNAME_MIN, `A felhasználónév legalább ${USERNAME_MIN} karakter legyen.`],
        maxlength: [USERNAME_MAX, `A felhasználónév legfeljebb ${USERNAME_MAX} karakter lehet.`],
        match: [USERNAME_PATTERN, "A felhasználónév csak betűket, számokat és a _ . - jeleket tartalmazhatja."]
    },
    // bcrypt hash, nem a jelszó maga
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
});

module.exports = mongoose.model("User", userSchema);
module.exports.USERNAME_MIN = USERNAME_MIN;
module.exports.USERNAME_MAX = USERNAME_MAX;
module.exports.USERNAME_PATTERN = USERNAME_PATTERN;
