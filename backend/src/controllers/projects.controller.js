const projectService = require("../services/project.service");

async function listProjects(req, res) {
  const projects = await projectService.listProjectsForUser(req.user);
  res.json(projects);
}

async function getProject(req, res) {
  res.json(req.project);
}

async function createProject(req, res) {
  const payload = await projectService.createProject(req.body);
  res.status(201).json(payload);
}

async function updateProject(req, res) {
  const payload = await projectService.updateProject(req.params.id, req.body);
  res.json(payload);
}

async function deleteProject(req, res) {
  const payload = await projectService.deleteProject(req.params.id);
  res.json(payload);
}

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
