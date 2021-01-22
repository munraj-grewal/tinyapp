//generates random string for shortURL
function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16);
};
//returns user depending on provided email
function getUserByEmail (email, users) {
  for(let user in users){
    if(email === users[user].email){
      return users[user];
    }
  }
  return false;
};
//returns all urls for provided user
function urlsForUser(id, urlDatabase) {
  let returnOBJ = {};
  for (let url in urlDatabase){
    if(id === urlDatabase[url].userID) {
      returnOBJ[url] = urlDatabase[url];
    }
  }
  return returnOBJ;
}

module.exports = {generateRandomString, getUserByEmail, urlsForUser};