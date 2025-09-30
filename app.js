// Core Module
const path = require("path");
require("dotenv").config();


// External Module
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const MongoDBStore = require("connect-mongodb-session")(session);
const DB_PATH = process.env.MONGO_URI;
//Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const rootDir = require("./utils/pathUtil");
const errorController = require("./controllers/error");
const authRouter = require("./routes/authRouter");
const { default: mongoose } = require("mongoose");

const app = express();
 
app.set("view engine", "ejs");
app.set("views", "views");

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = { storage, fileFilter };
const upload = multer(multerOptions);

app.use(express.urlencoded({ extended: true }));
app.use(upload.single("photo")); // photo is the name of input field

app.use(express.static(path.join(rootDir, "public")));

app.use(session({
  // secret used to sign the session Id cookie and encrypt the session data
  secret: process.env.SESSION_SECRET,
  // forces the session to be saved back to the session store, even if the session was never modified during the request
  resave: false,
  // forces a session that is "uninitialized" to be saved to the store
  saveUninitialized: true,
  // now all sessions are stored in mongoDB instead of server memory
  store: store,
}))
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next()
})
app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  console.log("host middleware");
  if(req.isLoggedIn){
    next();
  } else{ 
    return res.redirect('/login');
  }
});
app.use("/host", hostRouter)



app.use(errorController.get404);

const PORT = process.env.PORT || 3000;


// first mongo connect then server will start
mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("connected to mongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.log("error while connecting to mongoDB", err));
