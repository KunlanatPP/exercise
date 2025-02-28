const express = require("express");
const { createSession, endSession, getSessionHistory, getDetail, getUserGoals } = require("../controllers/sessionController");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateJWT, (req, res) => {
    res.render("session");
});

router.post("/", authenticateJWT, createSession);
router.post("/end", authenticateJWT, endSession);
router.get("/detail/:id", authenticateJWT, getDetail);
router.get("/api/history", authenticateJWT, getSessionHistory);
router.get("/user-goals", authenticateJWT, getUserGoals);

// ✅ เพิ่ม API `/session/current-user`
router.get("/current-user", authenticateJWT, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    res.json({ user_id: req.user._id });
});

module.exports = router;
