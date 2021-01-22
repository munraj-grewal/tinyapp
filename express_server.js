const {generateRandomString} = require("./helpers");
const {getUserByEmail} = require("./helpers");
const {urlsForUser} = require("./helpers");
const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const urlDatabase = {};
const users = {};
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secret keys', 'key'],
}));


////////////////////////////////
//all app.post functions below//
////////////////////////////////

//logs user in
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user === false) {
    res.send('incorrect email or password');
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.send('incorrect email or password');
  } else {
    req.session.userId = user.id;
    res.redirect("/urls");
  }
});
//logs out user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//registers user
app.post("/register", (req, res) => {
  const id = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    res.sendStatus(400);
  } else if (getUserByEmail(req.body.email, users)) {
    res.send('email already in use');
  } else {
    users[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.userId = id;
    res.redirect("/urls");
  }
});
//shows all users urls
app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = {longURL: req.body.longURL, userID: req.session.userId};
  res.redirect("/urls");
});
//deletes selected url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("please login");
  }
});
//updates longURL of selected url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});


///////////////////////////////
//all app.get functions below//
///////////////////////////////

//directs to either url list or login page based on login status
app.get("/", (req, res) => {
  if (req.session.userId) {
    const urls = {urls: urlsForUser(req.session.userId, urlDatabase), user: users[req.session.userId]};
    res.render("urls_index", urls);
  } else {
    res.render("login_page", {user: false});
  }
});
//shows registeration page
app.get("/register", (req, res) => {
  res.render("registration_page", {user: false});
});
//shows login page
app.get("/login", (req, res) => {
  res.render("login_page", {user: false});
});
//redirects user to selected url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});
//shows page with all users urls
app.get("/urls", (req, res) => {
  const urls = {urls: urlsForUser(req.session.userId, urlDatabase), user: users[req.session.userId]};
  res.render("urls_index", urls);
});
//shows page to create new short url
app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    res.render("urls_new", {user: users[req.session.userId]});
  } else {
    res.render("login_page", {user: false});
  }
});
//shows edit page for selected url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user: users[req.session.userId] };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});