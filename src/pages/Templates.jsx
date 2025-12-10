// src/pages/Templates.jsx
import React from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { Grid, Tag } from 'lucide-react';

export default function Templates() {
  const { templates, loading, error } = useTemplates();

  if (loading) return <div className="p-8">Loading templates...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Template Gallery</h1>
      
      {templates.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Grid size={48} className="mx-auto mb-4 opacity-30" />
          <p>No templates available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div key={template.id} className="p-5 bg-white border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.domain_tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-500">
                Complexity: <span className="font-medium capitalize">{template.complexity}</span>
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
