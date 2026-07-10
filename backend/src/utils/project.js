function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeParseJson(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function hydrateProject(project) {
  if (!project) return null;

  return {
    ...project,
    settings: safeParseJson(project.settings, {}),
    ...safeParseJson(project.data, {}),
  };
}

function serializeProjectPayload(project = {}) {
  const { settings, experiences, scenes, statistics, specs, gallery, attachments } = project;

  return {
    settings: JSON.stringify(settings || {}),
    data: JSON.stringify({
      experiences: experiences || [],
      scenes: scenes || {},
      statistics: statistics || {},
      specs: specs || {},
      gallery: gallery || [],
      attachments: attachments || [],
    }),
  };
}

module.exports = {
  ensureArray,
  hydrateProject,
  serializeProjectPayload,
};
