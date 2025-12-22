import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '..', '..', 'resources', 'templates');

export const listTemplates = async () => {
  try {
    if (!fs.existsSync(templatesDir)) {
      return [];
    }
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.yaml'));
    return files.map(file => {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
      const data = yaml.load(content);
      return {
        id: data.id,
        title: data.title,
        domain_tags: data.domain_tags,
        complexity: data.complexity,
        filename: file
      };
    });
  } catch (e) {
    return [];
  }
};

export const getTemplateById = async (id) => {
  try {
    if (!fs.existsSync(templatesDir)) {
      return null;
    }
    const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.yaml'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(templatesDir, file), 'utf8');
      const data = yaml.load(content);
      if (data.id === id) {
        return data;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};
