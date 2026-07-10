const authService = require("../services/auth.service");

async function login(req, res) {
  const payload = await authService.login(req.body);
  res.json(payload);
}

async function me(req, res) {
  const payload = await authService.getCurrentSessionUser(req.user.id);
  res.json(payload);
}

async function updateMyProfile(req, res) {
  const payload = await authService.updateMyProfile(req.user.id, req.body);
  res.json(payload);
}

async function changePassword(req, res) {
  const payload = await authService.changeMyPassword(req.user.id, req.body);
  res.json(payload);
}

module.exports = {
  login,
  me,
  updateMyProfile,
  changePassword,
};
