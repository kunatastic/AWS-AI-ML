// mongodb+srv://sentimentuser:rjn72E1qMl003jQN@cluster0.adcn3.mongodb.net/sentimentAnalysis
// Configurations
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Dependenices
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const path = require("path");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

// Customs Dependencies
const defaultRoutes = require("./routes/defaultRoutes");
const AWSRoutes = require("./routes/AWSRoutes");
const UserRoutes = require("./routes/UserRoute");

// Database connection
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var conn = mongoose.connection;
conn.on("connected", function () {
  console.log("DB connected!!");
});
conn.on("disconnected", function () {
  console.log("database is disconnected successfully");
});
conn.on("error", console.error.bind(console, "connection error:"));

// Middlewares
app.use(morgan("common"));
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.engine("html", ejs.renderFile);
app.use(express.static(path.join(__dirname, "/public")));
app.use(flash());
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Routes
app.use("/", defaultRoutes);
app.use("/aws", AWSRoutes);
app.use("/auth", UserRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`Listening at http://localhost:${PORT}`);
});
