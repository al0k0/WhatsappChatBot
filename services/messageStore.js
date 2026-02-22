const fs = require("fs");
const FILE = "./messageStore.json";

function load() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getStore() {
  return load();
}

function setUser(phone, data) {
  const store = load();
  store[phone] = data;
  save(store);
}

function updateUser(phone, data) {
  const store = load();
  store[phone] = { ...store[phone], ...data };
  save(store);
}

function deleteUser(phone) {
  const store = load();
  delete store[phone];
  save(store);
}

module.exports = {
  getStore,
  setUser,
  updateUser,
  deleteUser
};