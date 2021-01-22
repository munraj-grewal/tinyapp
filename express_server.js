const {generateRandomString} = require("./helpers");
const {getUserByEmail} = require("./helpers");
const {urlsForUser} = require("./helpers");
const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['secret keys', 'key'],

}))

const users = {};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "user_id"},
  "9sm5xK": {longURL: "http://www.google.ca", userID: "user_id"}
};

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  console.log(user);
  if(user === false){
    res.send('incorrect email or password');
  } else if(!bcrypt.compareSync(req.body.password, user.password)){
    res.send('incorrect email or password');
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies["user_id"]);
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  if(req.body.email === "" || req.body.password === ""){
    res.sendStatus(400);
  } else if(getUserByEmail(req.body.email, users)){
    res.send('email already in use');
  } else {
    users[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    }
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if(req.session.user_id){
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("please login");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("registration_page", {user: false});
});

app.get("/login", (req, res) => {
  res.render("login_page", {user: false});
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404); 
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  
  const urls = {urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id]}
  res.render("urls_index", urls);
});

app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    res.render("urls_new", {user: users[req.session.user_id]});
  } else {
    res.render("login_page", {user: false});
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user: users[req.session.user_id] }
  res.render("urls_show", templateVars);
});