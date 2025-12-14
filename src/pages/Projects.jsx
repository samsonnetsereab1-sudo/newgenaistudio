// src/pages/Projects.jsx
import React from 'react';
import { useProjects } from '../hooks/useProjects';
import { FolderOpen, Trash2, Plus, Calendar, CheckCircle2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FolderOpen className="text-white" size={36} />
                <h1 className="text-4xl font-bold text-white">My Projects</h1>
              </div>
              <p className="text-emerald-100 text-lg">Manage and organize your biologics applications</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <Plus size={20} /> New Project
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-12 px-6">
        {showForm && (
          <form onSubmit={handleCreate} className="mb-8 p-6 bg-slate-800 border border-slate-700 rounded-xl">
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/50"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setName(''); }}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={64} className="mx-auto mb-6 text-slate-600" />
            <p className="text-slate-400 text-lg mb-6">No projects yet. Create your first one!</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/50"
            >
              <Plus size={20} className="inline mr-2" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-white mb-2 group-hover:text-emerald-300 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="capitalize">{project.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar size={16} />
                        <span>{new Date(project.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <button className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-emerald-500/50 active:scale-95">
                    Open Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
