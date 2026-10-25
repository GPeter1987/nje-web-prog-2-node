const router = require("express").Router();
const controller = require("../controllers/crudController");
const { isAdmin } = require("../middleware/auth");

// Minden CRUD útvonal csak admin számára érhető el
router.use(isAdmin);

// Labdarúgók listázása
router.get("/", controller.index);

//Create
router.get("/create", controller.createGet);
router.post("/create", controller.createPost);

module.exports = router;
