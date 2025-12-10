/**
 * Template Gallery Component
 * Displays available app templates with descriptions and quick-start buttons
 */
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { APP_TEMPLATES } from '../lib/data';

export default function TemplateGallery() {
  const handleSelectTemplate = (template) => {
    // Store selected template and navigate to builder
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    window.location.href = '/build';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {APP_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="group relative bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleSelectTemplate(template)}
          >
            {/* Badge */}
            {template.badge && (
              <div className="absolute top-2 right-2">
                <span className="inline-block px-2 py-1 text-[10px] font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-slate-700 rounded">
                  {template.badge}
                </span>
              </div>
            )}

            {/* Icon & Title */}
            <div className="flex items-start gap-3 mb-2">
              <div className="text-2xl">{template.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">{template.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{template.category}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {template.desc}
            </p>

            {/* CTA */}
            <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium group-hover:gap-2 transition-all">
              <span>Use Template</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <div className="flex gap-2 text-xs">
          <Sparkles size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800">💡 Tip:</p>
            <p className="text-slate-700 mt-1">
              Templates come pre-configured with layouts, components, and sample data. You can fully customize them with our AI Builder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
