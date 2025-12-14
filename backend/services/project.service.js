let projects = [];

/**
 * List all projects
 */
export const listProjects = async () => {
  return projects;
};

/**
 * Get a project by ID
 */
export const getProjectById = async (id) => {
  return projects.find(p => p.id === id);
};

/**
 * Get a project (alias for getProjectById)
 */
export const getProject = async (id) => {
  return projects.find(p => p.id === id);
};

/**
 * Create a new project
 * 
 * @param {Object} data - Project data
 * @param {string} data.name - Project name
 * @param {string} [data.domain] - Domain type (biologics, pharma, generic)
 * @param {string} [data.type] - Project type (dashboard, form, studio-app, workflow)
 * @param {string[]} [data.tags] - Project tags
 * @param {string} [data.description] - Project description
 * @param {Object} [data.domainMeta] - Domain-specific metadata
 * @param {Object} [data.layout] - Layout configuration
 * @param {Object} [data.theme] - Theme configuration
 * @returns {Promise<Object>} - Created project
 */
export const addProject = async (data) => {
  const newProject = { 
    id: `proj_${Date.now()}`,
    name: data.name || 'Untitled Project',
    domain: data.domain || 'generic',
    type: data.type || 'studio-app',
    tags: data.tags || [],
    description: data.description || '',
    domainMeta: data.domainMeta || {},
    layout: data.layout || { routes: [], components: [] },
    dataSources: data.dataSources || [],
    actions: data.actions || [],
    permissions: data.permissions || [
      {
        role: 'viewer',
        description: 'Can view the application',
        routes: [],
        actions: []
      }
    ],
    theme: data.theme || {},
    status: 'draft',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    ...data 
  };
  projects.push(newProject);
  return newProject;
};

/**
 * Update a project
 */
export const updateProject = async (id, data) => {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  
  const updated = {
    ...projects[idx],
    ...data,
    updated: new Date().toISOString()
  };
  projects[idx] = updated;
  return updated;
};

/**
 * Remove a project
 */
export const removeProject = async (id) => {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const removed = projects.splice(idx, 1)[0];
  return removed;
};

export default {
  listProjects,
  getProjectById,
  getProject,
  addProject,
  updateProject,
  removeProject
};
