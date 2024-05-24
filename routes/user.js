const express = require("express");

const router = express.Router();

const User = require("../models/User");

//import de mes packages pour mdp de token
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

router.post("/signup", async (req, res) => {
  try {
    if (!req.body.username) {
      return res.status(400).json({ message: "username missing" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(400).json({ message: "user already in db" });
    }

    const salt = uid2(64);
    const token = uid2(64);

    const hash = SHA256(req.body.password + salt).toString(encBase64);

    // console.log(hash);

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    // console.log(newUser);

    await newUser.save();

    return res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    // console.log(req.body);

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ message: "email or password incorrect" });
    }

    const passwordHashed = SHA256(req.body.password + user.salt).toString(
      encBase64
    );

    if (passwordHashed === user.hash) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
