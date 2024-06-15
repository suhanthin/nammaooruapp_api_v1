const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
require("dotenv").config();
const dbConfig = require("./app/config/db.config");
const app = express();
var cron = require('node-cron');
global._basedir = __dirname;
app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "skvappDB-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);

const db = require("./app/models");
const Role = db.role;
const CronCheck = db.cronCheck;
const uri = "mongodb+srv://suhanthin:AQdotDsnTakm8And@cluster0.3ftshr3.mongodb.net/nammaooruapp_db_v1?retryWrites=true&w=majority";
//const uri = process.env.DATABASE;
//const uri = "mongodb://0.0.0.0:27017/nammaooruapp_db_v1?replicaSet=myReplicaSet";
db.mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to nammaooruapp application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/controllerList.routes")(app);
require("./app/routes/pageAccessPermission.routes")(app);
require("./app/routes/chantha.routes")(app);
require("./app/routes/chanthaHistory.routes")(app);
require("./app/routes/committeeMeeting.routes")(app);
require("./app/routes/deathTribute.routes")(app);
require("./app/routes/familyDetails.routes")(app);
require("./app/routes/dashboard.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "superadmin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'superadmin' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });

      new Role({
        name: "chitadmin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'chitadmin' to roles collection");
      });

      new Role({
        name: "chitcollectors",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'chitcollectors' to roles collection");
      });

      new Role({
        name: "member",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'member' to roles collection");
      });
    }
  });
}

// cronTime:'0 */2 * * * *',  2 mins
// cronTime:'0 0 1 * *',  1 month
const { chanthaHistoryCronRun } = require("./app/utils/chanthaHistoryActions");
cron.schedule("0 0 1 * *", async () => {
  var s = new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
  console.log('Running a job at ' + s + ' at Asia/Kolkata timezone');
  chanthaHistoryCronRun()
});