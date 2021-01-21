const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "user_id"},
  "9sm5xK": {longURL: "http://www.google.ca", userID: "user_id"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

app.post("/login", (req, res) => {
  const user = checkPassword(req.body.email, req.body.password);
  if(user === false){
    res.send('incorrect email or password');
  } else {
    res.cookie('user_id', user);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies["user_id"]);
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  let user;
  if(req.body.email === "" || req.body.password === ""){
    res.sendStatus(400);
  } else if(checkEmail(req.body.email)){
    res.send('email already in use');
  } else {
    users[id] = {
      id: id,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie('user_id', id);
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  const short = generateRandomString();
  urlDatabase[short] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
  console.log(urlDatabase[short]);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newURL;
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
  const urls = {urls: urlDatabase, user: users[req.cookies["user_id"]]}
  res.render("urls_index", urls);
});

app.get("/urls/new", (req, res) => {
  if(req.cookies["user_id"]){
    res.render("urls_new", {user: users[req.cookies["user_id"]]});
  } else {
    res.render("login_page", {user: false});
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  user: users[req.cookies["user_id"]] }
  res.render("urls_show", templateVars);
});

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
};

function checkEmail (email) {
  for(let user in users){
    if(email === users[user].email){
      return true;
    }
  }
};

function checkPassword (email, password) {
  for(let user in users){
    if(email === users[user].email && password === users[user].password){
      return user;
    }
  }
  return false
};