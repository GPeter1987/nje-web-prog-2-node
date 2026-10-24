const router = require("express").Router();
const controller = require("../controllers/crudController");
const { isAdmin } = require("../middleware/auth");

// Az app.js-ben a /crud alá van csatolva, és minden útvonala csak adminnak érhető el
router.use(isAdmin);
router.get("/", controller.index);
module.exports = router;
