const { verifySignUp, authJwt, checkValueExisted } = require("../middlewares");
const controller = require("../controllers/user.controller");
const { checkChanthaIdExisted } = require("../middlewares/checkValueExisted");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // app.get(
  //   "/api/user/update/:key",
  //   [
  //     authJwt.verifyToken, 
  //     verifySignUp.checkDuplicateUsername,
  //     verifySignUp.checkRolesExisted,
  //     authJwt.ischeckLoggedin,
  //     authJwt.isSuperadminorAdmin,
  //     checkValueExisted.checkPositionNameExisted
  //   ],
  //   controller.update
  // );

  app.get(
    "/api/user/delete/:key",
    [
      authJwt.verifyToken,
      authJwt.ischeckLoggedin,
      authJwt.isSuperadminorAdmin
    ],
    controller.delete
  );

  app.post(
    "/api/usersList",
    [
      // authJwt.verifyToken, 
      // authJwt.isSuperadminorAdmin
    ],
    controller.usersList
  );

  app.post(
    "/api/user/bulkInsert",
    [
      authJwt.verifyToken,
      verifySignUp.checkDuplicateUsername,
      verifySignUp.checkRolesExisted,
      authJwt.ischeckLoggedin,
      authJwt.isSuperadminorAdmin
    ],
    controller.bulkInsert
  );

  app.post(
    "/api/user/detail/",
    [
      // authJwt.verifyToken,
      // authJwt.ischeckLoggedin,
      // authJwt.isSuperadminorAdmin
    ],
    controller.getuserDetail
  );

  app.post(
    "/api/user/search/",
    [
      authJwt.verifyToken,
      authJwt.ischeckLoggedin,
      authJwt.isSuperadminorAdmin
    ],
    controller.usersearch
  );

  app.post(
    "/api/administratorList",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.administratorList
  );

  app.post("/api/user/customMemberList",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.customMemberList
  );
};
