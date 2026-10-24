const router = require("express").Router();
const controller = require("../controllers/messageController");
const { isLoggedIn } = require("../middleware/auth");

router.get("/kapcsolat", controller.kapcsolatGet);
router.get("/uzenetek", isLoggedIn, controller.uzenetekIndex);
module.exports = router;
