const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
var jwt = require("jsonwebtoken");
// Load User model
const User = require("../../models/user/Customer");

var nodemailer = require("nodemailer");
var SHA256 = require("crypto-js/sha256");

require("dotenv").config();

var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_ADDRESS,
    clientId: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    refreshToken: process.env.REFRESHTOKEN,
    accessToken: process.env.ACCESSTOKEN,
  },
});

// Register
router.post("/register", (req, res) => {
  const {
    name,
    email,
    password,
    password2,
    designation,
    mobile,
    organization,
    address1,
    address2,
    address3,
    postcode,
    city,
    state,
  } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({
      msg: "Please enter all fields",
    });
  }

  if (password != password2) {
    errors.push({
      msg: "Passwords do not match",
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: "Password must be at least 6 characters",
    });
  }

  if (errors.length > 0) {
    console.log("error");
    return res.status(400).json({
      errors: errors,
    });
  } else {
    User.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        console.log("Email already exists");
        console.log(errors);
        errors.push({
          msg: "Email already exists",
        });
        return res.status(400).json({
          errors: errors,
        });
      } else {
        var randKey = SHA256(email);
        const newUser = new User({
          name,
          email,
          password,
          verify: false,
          verifyHash: randKey,
          designation,
          mobile,
          organization,
          address1,
          address2,
          address3,
          postcode,
          city,
          state,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                // console.log("done register");
                return res.json({
                  user: user,
                });
              })
              .then(() => {
                host = req.get("host");
                link =process.env.BOOKING_BACKEND_URL +"/customer/verify?id=" +randKey;
                var mail = {
                  from: process.env.MAIL_ADDRESS,
                  to: email,
                  subject: "Registration successful",
                  text: "You successfully registered an account at" + host,
                  html:
                    "<p>You successfully registered an account at example.com " +
                    ". Please verify by clicking the link.\n" +
                    link +
                    "</p>",
                };
                transporter.sendMail(mail, function (err, info) {
                  if (err) {
                    console.log(err);
                  } else {
                    // see https://nodemailer.com/usage
                    console.log("info.messageId: " + info.messageId);
                    console.log("info.envelope: " + info.envelope);
                    console.log("info.accepted: " + info.accepted);
                    console.log("info.rejected: " + info.rejected);
                    console.log("info.pending: " + info.pending);
                    console.log("info.response: " + info.response);
                  }
                  transporter.close();
                });
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

router.get("/verify", function (req, res) {
  // console.log(req.protocol + "://" + req.get("host"));
  if (req.get("host") == req.get("host")) {
    // console.log("Domain is matched. Information is from Authentic email");

    const hashID = req.query.id;
    var condition = {};

    if (hashID != null && hashID != "") {
      condition["verifyHash"] = {
        $regex: hashID,
      };
    } else {
      res.json("no hash");
    }

    condition = {
      verifyHash: hashID,
    };

    // console.log(condition);
    User.find(condition)
      .updateOne({
        verify: true,
      })
      .then((data) => {
        if (data.n === 1) {
          res.redirect(process.env.BOOKING_FRONTEND_URL + "/verify");
        } else {
          res.json("not verified");
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving.",
        });
      });
  }
});

//custom callback//
router.post("/login", function (req, res, next) {
  passport.authenticate(
    "customer-local",
    {
      session: false,
    },
    function (err, userData, info) {
      if (err) {
        return next(err);
      }

      if (!userData) {
        console.log("invalid customer");
        return res.status(400).json({
          error: "Invalid login. Please try again.",
        });
      }

      if (!userData.verify) {
        console.log("not verified");
        return res.status(400).json({
          error: "Invalid login. Not verified.",
        });
      }

      req.logIn(userData, function (err) {
        if (err) {
          return next(err);
        } else {
          User.findOneAndUpdate(
            {
              email: userData.email,
            },
            {
              lastLogin: Date.now(),
            }
          ).catch((err) => {
            console.log(err);
          });

          const user = {
            name: userData.name,
            email: userData.email,
          };

          // // if userData is found and password is right create a token
          var token = jwt.sign(user, process.env.CONFIG_SECRET, {
            expiresIn: 60000,
          });
          // // return the information including token as JSON
          return res.json({
            user,
            token,
          });
        }
      });
    }
  )(req, res, next);
});

// logout after adding jwt//
router.get(
  "/logout",
  passport.authenticate("jwt", {
    session: false,
  }),
  function (req, res) {
    res.clearCookie("jwt");
    req.logout();
    return res.send({
      Msg: "You are logged out",
    });
  }
);

router.get("/getall", async function (req, res) {
  try {
    const data = await User.find({});
    res.json(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving.",
    });
  }
});

router.post("/forgotPassword", async (req, res) => {
  email = req.body.email;

  if (email === "") {
    res.status(400).send("email required");
  }

  try {
    const token = SHA256(email);
    const data = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      {
        upsert: false,
        useFindAndModify: false,
      }
    );
    link =process.env.BOOKING_BACKEND_URL +`/customer/reset/?resetPasswordToken=${token}`;
    if (!data) {
      res.status(404).send({
        message: `Cannot find ${email}. Maybe user is not registered!`,
      });
    } else {
      res.send({
        message: "user was updated successfully at " + link,
      });
    }
  } catch (err) {
    // console.log(err)
    res.status(500).send({
      message: "Error",
    });
  } finally {
    const mailOptions = {
      from: process.env.MAIL_ADDRESS,
      to: email,
      subject: "Link To Reset Password",
      text:
        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
        link +
        "  .If you did not request this, please ignore this email and your password will remain unchanged.\n",
    };
    // console.log('sending mail');
    // console.log(link);
    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("there was an error: ", err);
      } else {
        // console.log('here is the res: ', response);
        res.status(200).json("recovery email sent");
      }
    });
    transporter.close();
  }
});

router.get("/reset", (req, res) => {
  var condition = {};
  var resetPasswordToken = req.query.resetPasswordToken;
  // console.log(resetPasswordToken)
  if (resetPasswordToken != null && resetPasswordToken != "") {
    condition["resetPasswordToken"] = {
      $regex: resetPasswordToken,
    };
  }

  condition["resetPasswordExpires"] = {
    $gt: Date.now(),
  };

  User.findOne(condition).then((user) => {
    if (user == null) {
      // console.error('password reset link is invalid or has expired');
      res.status(404).send({
        message: `password reset link is invalid or has expired!`,
      });
    } else {
      res.redirect(process.env.BOOKING_FRONTEND_URL +"/resetpass/?resetPasswordToken=" +resetPasswordToken);
    }
  });
});

router.put("/updatePasswordViaEmail", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const data = await User.findOneAndUpdate(
      {
        email: req.body.email,
        resetPasswordToken: req.body.resetPasswordToken,
        resetPasswordExpires: {
          $gt: Date.now(),
        },
      },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }
    );
    if (!data) {
      res.status(404).send({
        message: `Cannot update user. Maybe user was not found!`,
      });
    } else {
      res.send({
        message: "user was updated successfully.",
      });
    }
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
