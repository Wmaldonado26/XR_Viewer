export const getOrderedVisibleZones = (project) => {
  if (!project || !project.experiences) return [];
  // Return experiences ordered by orderIndex, fallback to 0
  return [...project.experiences].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
};
