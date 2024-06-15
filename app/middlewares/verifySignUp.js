const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsername = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (user) {
      if(req.params.key == user._id.toString()){
        next();
        return;
      } else {
        res.status(400).send({ message: "Failed! Username is already in use!" });
        return;
      }
    }
    next();
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    //for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles)) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles} does not exist!`,
        });
        return;
      }
    //}
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsername,
  checkRolesExisted,
};

module.exports = verifySignUp;
