let projects = [];

export const listProjects = async () => {
  return projects;
};

export const getProjectById = async (id) => {
  return projects.find(p => p.id === id);
};

export const addProject = async (data) => {
  const newProject = { 
    id: `proj-${Date.now()}`, 
    status: 'draft',
    created: new Date().toISOString(),
    ...data 
  };
  projects.push(newProject);
  return newProject;
};

export const removeProject = async (id) => {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const removed = projects.splice(idx, 1)[0];
  return removed;
};
