const express = require("express");
const morgan = require("morgan");
const uuid = require("uuid/v4");
const cookieParser = require("cookie-parser");

const PORT = 4567;

// creating an Express app
const app = express();

// morgan middleware allows to log the request in the terminal
app.use(morgan("short"));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Static assets (images, css files) are being served from the public folder
app.use(express.static("public"));

// Setting ejs as the template engine
app.set("view engine", "ejs");
// activate cookieParser
app.use(cookieParser());

// object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const findUserByEmail = function (email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};
const createUser = function (name, email, password, users) {
  const userId = uuid().substring(0, 6);

  // adding to an object
  // objectname[key] = value
  // Create a new user
  users[userId] = {
    id: userId,
    name,
    email,
    password,
  };

  return userId;
};
const authenticateUser = function (email, password, usersDb) {
  // retrieve the user from the db
  const userFound = findUserByEmail(email, usersDb);

  // compare the passwords
  // password match => log in
  // password dont' match => error message
  if (userFound && userFound.password === password) {
    return userFound;
  }

  return false;
};
app.get("/", (req, res) => {
  res.send("Big Whiz here!");
});

// AUTHENTICATION ROUTES (login + register)

app.get("/register", (req, res) => {
  const templateVars = { user: null };

  // display the register form
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // we need to extract the info from the body of request => req.body
  console.log("req.body:", req.body);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // const {name, email, password} = req.body; // destructuring

  // check if that user already exist in the usersDb
  // if yes, send back error message
  // if no, we're good

  // userFound can be a user object OR
  // false
  const userFound = findUserByEmail(email, users);

  console.log("userFound:", userFound);

  if (userFound) {
    res.status(401).send("Sorry, that user already exists!");
    return;
  }

  // userFound is false => ok register the user

  const userId = createUser(name, email, password, usersDb);

  // Log the user => ask the browser to set a cookie with the user id
  res.cookie("user_id", userId);

  // redirect to '/'

  res.redirect("/");
});
app.get("/login", (req, res) => {
  const templateVars = { user: null };

  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  // extract the email and password from the body of request => req.body

  const email = req.body.email;
  const password = req.body.password;

  // compare the passwords
  // password match => log in
  // password dont' match => error message

  const user = authenticateUser(email, password, users);

  if (user) {
    // user is authenticated
    // setting the cookie
    res.cookie("user_id", user.id);

    // redirect to /quotes
    res.redirect("/"); //=> hey browser, can you do another request => get /quotes
    return;
  }

  // user is not authenticated => send error

  res.status(401).send("Wrong credentials!");
});

app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
