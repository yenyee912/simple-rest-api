// const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

// Load User model
const User = require("../models/user/User");
const Customer = require("../models/user/Customer");

// const passport    = require('passport');
const passportJWT = require("passport-jwt");

const ExtractJwt = passportJWT.ExtractJwt;

const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = passportJWT.Strategy;

require("dotenv").config();


module.exports = function (passport) {
  passport.use('user-local',
    new LocalStrategy({
        usernameField: "email",
      },
      (email, password, done) => {
        // Match user
        User.findOne({
          email: email,
        }).then((user) => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered",
            });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Password incorrect",
              });
            }
          });
        });
      }
    )
  );

  passport.use('customer-local',
    new LocalStrategy({
        usernameField: "email",
      },
      (email, password, done) => {
        // Match user
        Customer.findOne({
          email: email,
        }).then((user) => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered",
            });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Password incorrect",
              });
            }
          });
        });
      }
    )
  );



  passport.serializeUser(function (user, done) {
    // console.log("serializeUser is here :" + user.name)
    var key = {
      id: user.id,
      type: user.__t
    }
    done(null, key);
  });

  // passport.deserializeUser(function (id, done) {
  //   console.log("id is here" + id)
  //   User.findById(id, function (err, user) {
  //     done(err, user);
  //   });
  // });

  passport.deserializeUser(function (key, done) {
    // console.log("deserialize is here " + key)
    var Model = key.type === 'customer' ? Customer : User;
    Model.findById(key.id, function (err, user) {
      done(err, user);
    });
  });


  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  // opts.jwtFromRequest = cookieExtractor();
  opts.secretOrKey = process.env.CONFIG_SECRET;

  passport.use(
    new JwtStrategy(opts, function (jwt_payload, done) {
      User.findOne({
          id: jwt_payload.id,
        },
        function (err, user) {
          if (err) {
            console.log("JWT error");
            return done(err, false);
          }
          if (user) {
            console.log("JWT success");
            done(null, user);
          } else {
            console.log("JWT failed");
            done(null, false);
          }
        }
      );
    })
  );
};