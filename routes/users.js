var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Item = require("../models/Item.js");
const jwt = require("jsonwebtoken");
const validateToken = require("../auth/validateToken.js");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* GET users listing. */
router.get("/list", validateToken, (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) return next(err);
    res.render("users", { users });
  });
});

router.post(
  "/api/user/register",
  body("email").isLength({ min: 3 }).trim().escape().isEmail().normalizeEmail(),
  body("password").isLength({min: 8}).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()-_+={}[\]|;:"<>,./?])/),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existingUser = await User.findOne({ email: req.body.email });

      if (existingUser) {
        return res.status(403).json({ email: "Email already in use." });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);

        await User.create({
          email: req.body.email,
          password: hash,
        });
        //return res.redirect("/login.html");
        return res.status(201).json({ message: "Registration successful!" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/api/user/login", upload.none(), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(403).json({ message: "Invalid credentials" });
    } else {
      const isMatch = bcrypt.compare(req.body.password, user.password);

      if (isMatch) {
        const jwtPayload = {
          id: user._id,
          email: user.email,
        };

        jwt.sign(
          jwtPayload,
          process.env.SECRET,
          {
            expiresIn: 180,
          },
          (err, token) => {
            if (err) throw err;
            res.json({ success: true, token });
          }
        );
      } else {
        return res.status(403).json({ message: "Invalid credentials" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/index", validateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ email: user.email });
  } catch (error) {
    console.error("Error in finding id", error);
  }
});

router.post("/addItem", validateToken, async (req, res, next) => {
  try {

    console.log(req.body.items);
    const existingUser = await Item.findOne({ user: req.user.id });
    const itemHolder = req.body.items;
    console.log(req.body.items);
    if (existingUser) {
      existingUser.items.push(itemHolder);
      await existingUser.save();
    } else {
      await Item.create({
        user: req.user.id,
        items: itemHolder,
      });
      return res.status(200).json({ message: "OK" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getItems", validateToken, async (req, res, next) => {
  try {
    const existingUser = await Item.findOne({ user: req.user.id });
    if (existingUser) {
      return res.json({ items: existingUser.items });
    }
  } catch (error) {
    console.error("Error getting items: ", error);
  }
});

module.exports = router;
