const router = require("express").Router();
const controller = require("../controllers/dataController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/adatbazis", controller.adatbazisIndex);
router.get("/diagram", isLoggedIn, controller.diagramIndex);
module.exports = router;
