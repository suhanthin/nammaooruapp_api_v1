const { authJwt, checkValueExisted, verifySignUp } = require("../middlewares");
const controller = require("../controllers/dashboard.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.get(
    "/api/dashboard/dashboardDataList",
    [
    //   authJwt.verifyToken, 
    //   authJwt.isSuperadminorAdmin
    ],
    controller.dashboardDataList
  );

  app.get(
    "/api/dashboard/dashboardMemberCount",
    [
    //   authJwt.verifyToken, 
    //   authJwt.isSuperadminorAdmin
    ],
    controller.dashboardMemberCount
  );

  
};
