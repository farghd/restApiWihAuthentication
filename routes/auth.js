require('dotenv').config()
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { Router } = require("express");
const User = require('../models/user');

//1. USER PROVIDES AN EMAIL & PASSWORD
//2. THEN WE SHOULD VALIDATE IF THE EMAIL AND PASSWORD MEETS OUR CRITERIA(FOR THIS, WE ARE USING EXPRESS-VALIDATOR LIBRARY)
router.post(
  "/signup",
  [
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Please provide a password that is greater than 5 characters. All characters should be in lowercase"
    )
      .isLength({ min: 6 })
      .isLowercase(),
  ],
  async (req, res) => {
    const { password, email } = req.body;

    //...VALIDATED THE INPUT
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    //3.THEN WE VALIDATE IF USER DOESN'T ALREADY EXIST. IF EXISTS, AN ERROR WILL BE THROWN

    const user = await User.findOne({
        where:{email}
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
        password: hashedPassword,
    });

    //6. GENERATING THE TOKEN
    const token = await JWT.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 30000000,
      }
    );

    res.json({
      token,
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
        }
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

//5. THEN, THE HASHED PASSWORD IS BEING SAVED TO DB(THIS SECTION MOVED TO THE BOTTOM ON PURPOSE)
router.get("/all", (req, res) => {
  res.json(users);
});

module.exports = router;
