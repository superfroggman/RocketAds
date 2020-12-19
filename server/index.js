const express = require("express"),
  app = express(),
  port = 3000,
  dbModule = require("./dbModule.js"),
  Ad = require("./models/Ad.js"),
  User = require("./models/User.js"),
  bodyParser = require("body-parser"),
  passport = require("passport"),
  flash = require("express-flash"),
  cors = require("cors"),
  session = require("express-session"),
  methodOverride = require("method-override"),
  sessionstore = require("sessionstore"),
  fs = require("fs");

//ConnectToMongo
let store;
connectToMongo("RocketAds");

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

const { isNumber } = require("util");
const initializePassport = require("./config/passport.js");
initializePassport(
  passport,
  (name) => User.find((user) => user.name === name),
  (id) => User.find((user) => user.id === id)
);

//Check if production or debug
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//Enables EJS
app.set("view engine", "ejs");

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
  createAd("https://cloudremover.com", "https://cloudremover.com/favicon.ico");
});

app.get("/ad", async (req, res) => {
  let ads = await dbModule.findInDB(Ad);
  let ad = ads[Math.floor(Math.random() * ads.length)];

  dbModule.updateCoins(User, ad.user, -1);

  res.render("ad", {
    linkUrl: ad.linkUrl,
    imageUrl: ad.imageUrl,
  });
});

app.get("/adRedir", async (req, res) => {
  let ad = await dbModule.findAdWithUrl(Ad, req.query.ad);
  console.log(ad)
  dbModule.updateCoins(User, ad.user, -10);

  res.redirect(ad.linkUrl);
});

//Get Request
app.get("/register", checkNotAuthenticated, async (req, res) => {
  res.render("register");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/newAdd", checkAuthenticated, (req, res) => {
  res.render("newAdd");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//Logout request
app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

//POST ROUTES
app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const userExist = await dbModule.findInDBOne(User, req.body.name);
    if (userExist == null) {
      dbModule.saveToDB(createUser(req.body.name, req.body.password));
      res.status(201).send();
    } else {
      return res.status(400).send("taken");
    }
  } catch {
    res.status(500).send();
  }
});

app.post("/addAd", checkAuthenticated, async (req, res) => {
  try {
    if(req.body.imageUrl && req.body.linkUrl){
      let tmp = await req.user;
      createAd(req.body.linkUrl, req.body.imageUrl, tmp.name)
    }
    res.sendStatus(201)
  } catch (error) {
    res.sendStatus(500)
  }
  
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));

//Functions
function createAd(linkUrl, imageUrl, user) {
  if (linkUrl && imageUrl) {
    dbModule.saveToDB(
      new Ad({
        linkUrl: linkUrl,
        imageUrl: imageUrl,
        user: user
      })
    );
  }
}

function createUser(nameIN, passIN) {
  return new User({
    name: nameIN,
    password: passIN,
  });
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function connectToMongo(dbName) {
  if (fs.existsSync("mongoauth.json")) {
    const mongAuth = require("./mongoauth.json");
    dbModule.cnctDBAuth(dbName);
    store = sessionstore.createSessionStore({
      type: "mongodb",
      authSource: "admin",
      username: mongAuth.username,
      password: mongAuth.pass,
    });
  } else {
    dbModule.cnctDB(dbName);
    store = sessionstore.createSessionStore({ type: "mongodb" });
  }
}
