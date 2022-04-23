require("dotenv").config();
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { Router } = require("express");
const User = require("../models/user");

//1. USER PROVIDES AN EMAIL & PASSWORD
//2. THEN WE SHOULD VALIDATE IF THE EMAIL AND PASSWORD MEETS OUR CRITERIA(FOR THIS, WE ARE USING EXPRESS-VALIDATOR LIBRARY)
router.post(
  "/signup",
  [
    check("email", "Please provide a valid email").isEmail(),
    check("username", "Please provide a username").exists(),
    check(
      "password",
      "Please provide a password that is greater than 5 characters. All characters should be in lowercase"
    )
      .isLength({ min: 6 })
      .isLowercase(),
  ],
  async (req, res) => {
    const { password, email, username } = req.body;

    //...VALIDATED THE INPUT
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    //3.THEN WE VALIDATE IF USER DOESN'T ALREADY EXIST. IF EXISTS, AN ERROR WILL BE THROWN

    const user = await User.findOne({
      where: { email },
    });

    if (user) {
      return res.status(400).json({
        errors: [
          {
            msg: "This user already exists",
          },
        ],
      });
    }

    //4. NOW WE HASH THE RECEIVED PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = User.create({
      email,
      username,
      password: hashedPassword,
    });

    //6. GENERATING THE TOKEN
    const token = await JWT.sign(
      {
        email,
        username
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 30000000,
      }
    );

    res.json({
      token,
      user: username,
    });
  }
);

//AFTER CREATING THE SIGUN UP ROUTE, NOW WE CREATE LOGINF ROUTE
router.post("/login", async (req, res) => {
  const { password, email } = req.body;

  //   let user = users.find((user) => {
  //     return user.email === email;
  //   });

  const user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(400).json({
      errors: [
        {
          msg: "Invalid Credentials",
        },
      ],
    });
  }

  let isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({
      errors: [
        {
          msg: "Invalid Credentials",
        },
      ],
    });
  }

  const token = await JWT.sign(
    {
      email,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10h",
    }
  );

  res.json({
    token,
  });
});

router.get("/token", async (req, res) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(400).json({
      errors: [
        {
          msg: "No token found",
        },
      ],
    });
  }

  try {
    let user = await JWT.verify(token, process.env.JWT_SECRET);
    res.json({
      user: user.username,
    });
  } catch (error) {
     res.status(400).json({
      errors: [
        {
          msg: "Token invalid"
        },
      ],
    });
  }
});

//5. THEN, THE HASHED PASSWORD IS BEING SAVED TO DB(THIS SECTION MOVED TO THE BOTTOM ON PURPOSE)
router.get("/all", (req, res) => {
  res.json(users);
});

module.exports = router;
