const express = require("express"),
  app = express(),
  port = 3000,
  dbModule = require("./dbModule.js"),
  Ad = require("./models/ad.js");
(bodyParser = require("body-parser")),
  (passport = require("passport")),
  (flash = require("express-flash")),
  (cors = require("cors")),
  (session = require("express-session")),
  (methodOverride = require("method-override")),
  (cookie = require("cookies")),
  (cookieParser = require("cookie-parser")),
  (sessionstore = require("sessionstore"));

//ConnectToMongo
let store;
dbModule.connectToMongo("RocketAds");

/*Enables JSON, Cookies, extended for express and 
creates a static path for CSS etc */
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    secret: "keyboard cat",
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize(undefined));
app.use(passport.session(undefined));
app.use(methodOverride("_method"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//Enables EJS
app.set("view engine", "ejs");

createAd("https://marksism.space/", "https://marksism.space/favicon.ico");

app.get("/", async (req, res) => {
  let ads = await dbModule.findInDB(Ad);
  let ad = ads[Math.floor(Math.random() * ads.length)];

  res.render("ad", {
    linkUrl: ad.linkUrl,
    imageUrl: ad.imageUrl,
  });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

//Functions
function createAd(linkUrl, imageUrl) {
  if (linkUrl && imageUrl) {
    dbModule.saveToDB(
      new Ad({
        linkUrl: linkUrl,
        imageUrl: imageUrl,
      })
    );
  }
}
