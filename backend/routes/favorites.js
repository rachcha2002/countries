const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const Favorite = require("../models/favorite");
const auth = require("../middleware/auth");

// Get all favorites for a user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userFavorites = await Favorite.findOne({ userId });

    res.json({
      favorites: userFavorites ? userFavorites.countryCodes : [],
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add or remove a favorite
router.post(
  "/toggle",
  auth,
  [body("countryCode").notEmpty().withMessage("Country code is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.uid;
      const { countryCode } = req.body;

      let userFavorites = await Favorite.findOne({ userId });

      if (!userFavorites) {
        // Create new favorites document if it doesn't exist
        userFavorites = new Favorite({
          userId,
          countryCodes: [countryCode],
        });
      } else {
        // Toggle favorite
        if (userFavorites.countryCodes.includes(countryCode)) {
          // Remove if exists
          userFavorites.countryCodes = userFavorites.countryCodes.filter(
            (code) => code !== countryCode
          );
        } else {
          // Add if doesn't exist
          userFavorites.countryCodes.push(countryCode);
        }
        userFavorites.updatedAt = Date.now();
      }

      await userFavorites.save();
      res.json({
        favorites: userFavorites.countryCodes,
        added: userFavorites.countryCodes.includes(countryCode),
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
