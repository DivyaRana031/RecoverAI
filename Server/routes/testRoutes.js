const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route!",
    userId: req.userId,
  });
});

module.exports = router;