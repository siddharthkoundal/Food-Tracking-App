require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");
const Emitter = require("events");

//Database Connection
const url = "mongodb://localhost/pizza";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection
  .once("open", () => {
    console.log("Database connected...");
  })
  .on("error", (err) => {
    console.log(err);
  });

// Session store
let mongoStore = MongoDbStore.create({
  mongoUrl: url,
  collection: "sessions",
});

//Event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

//Session config
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
  })
);

// Passport Config

const passportInit = require("./app/config/passport");
passportInit(passport);

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "hello",
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//Assets
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

//set Template Engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

require("./routes/web")(app);

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

//Socket

const io = require("socket.io")(server);
io.on("connection", (socket) => {
  //Join
  socket.on("join", (roomName) => {
    socket.join(roomName);
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
