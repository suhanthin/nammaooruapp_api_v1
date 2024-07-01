const { authJwt, checkValueExisted, verifySignUp } = require("../middlewares");
const controller = require("../controllers/chantha.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/chantha/create",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.create
  );

  app.post(
    "/api/chantha/list",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.chanthaList
  );

  app.post(
    "/api/chantha/update",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.update
  );

  app.get(
    "/api/chantha/delete",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.delete
  );

  app.post(
    "/api/chantha/detail",
    [
      authJwt.verifyToken,
      authJwt.isSuperadminorAdmin
    ],
    controller.getChanthaDetail
  );
};
