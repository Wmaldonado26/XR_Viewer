const userService = require("../services/user.service");

async function listUsers(req, res) {
  const users = await userService.listUsers();
  res.json({ success: true, users });
}

async function createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json({ success: true, user });
}

async function updateUser(req, res) {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json({ success: true, user });
}

async function deleteUser(req, res) {
  await userService.deleteUser(req.params.id, req.user.id);
  res.json({ success: true });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
