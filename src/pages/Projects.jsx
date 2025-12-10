// src/pages/Projects.jsx
import React from 'react';
import { useProjects } from '../hooks/useProjects';
import { FolderOpen, Trash2, Plus } from 'lucide-react';

export default function Projects() {
  const { projects, loading, error, createProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createProject({ name, owner: 'current-user' });
      setName('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (loading) return <div className="p-8">Loading projects...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-slate-50 rounded-lg">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Project name"
            className="w-full px-3 py-2 border rounded mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-200 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p>No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm">
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm text-slate-500">
                  {project.status} • {new Date(project.created).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2 text-slate-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
