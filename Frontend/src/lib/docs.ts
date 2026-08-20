import fs from 'fs';
import path from 'path';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocPost {
  slug: string;
  title: string;
  description?: string;
  order?: number;
  category: string;
  content: string;
}

export function getDocSlugs(dir = docsDirectory): string[] {
  if (!fs.existsSync(dir)) return [];
  
  let slugs: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      slugs = slugs.concat(getDocSlugs(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(docsDirectory, fullPath);
      slugs.push(relativePath.replace(/\\/g, '/').replace(/\.md$/, ''));
    }
  }
  
  return slugs;
}

// Simple regex parser for markdown frontmatter
function parseFrontmatter(fileContents: string) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = fileContents.match(frontmatterRegex);
  
  if (!match) return { data: {}, content: fileContents };
  
  const rawData = match[1];
  const content = match[2];
  const data: Record<string, any> = {};
  
  rawData.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let value = line.slice(colonIdx + 1).trim();
      // Remove surrounding quotes if they exist
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      if (key === 'order') {
        data[key] = parseInt(value, 10);
      } else {
        data[key] = value;
      }
    }
  });
  
  return { data, content };
}

export function getDocBySlug(slug: string[] | string): DocPost | null {
  try {
    const realSlug = Array.isArray(slug) ? slug.join('/') : slug;
    // Normalize path for Windows/Linux
    const fullPath = path.join(docsDirectory, ...realSlug.split('/')) + '.md';
    
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = parseFrontmatter(fileContents);

    // Extract category from path
    const parts = realSlug.split('/');
    const category = parts.length > 1 ? parts[0] : 'General';

    return {
      slug: realSlug,
      title: data.title || realSlug,
      description: data.description || '',
      order: data.order || 999,
      category,
      content,
    };
  } catch (e) {
    console.error("Error reading doc:", e);
    return null;
  }
}

export function getAllDocs(): DocPost[] {
  const slugs = getDocSlugs();
  const docs = slugs
    .map((slug) => getDocBySlug(slug))
    .filter(Boolean) as DocPost[];

  // Sort docs by order
  return docs.sort((a, b) => (a.order || 999) - (b.order || 999));
}

export function getDocsGroupedByCategory(): Record<string, DocPost[]> {
  const docs = getAllDocs();
  const grouped: Record<string, DocPost[]> = {};

  docs.forEach((doc) => {
    // Standardize category name (e.g., '1-getting-started' -> 'Getting Started')
    const categoryName = doc.category
      .replace(/^\d+-/, '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    if (!grouped[categoryName]) {
      grouped[categoryName] = [];
    }
    grouped[categoryName].push(doc);
  });

  return grouped;
}
export function getPrevNextDocs(slug: string) {
  const allDocs = getAllDocs();
  // We need a stable flat list of docs grouped by category, the same way the sidebar renders them
  const grouped = getDocsGroupedByCategory();
  const flatDocs: DocPost[] = [];
  for (const cat in grouped) {
    flatDocs.push(...grouped[cat]);
  }
  
  const index = flatDocs.findIndex(d => d.slug === slug || d.slug === slug.replace(/\\/g, '/'));
  if (index === -1) return { prev: null, next: null };
  
  return {
    prev: index > 0 ? flatDocs[index - 1] : null,
    next: index < flatDocs.length - 1 ? flatDocs[index + 1] : null
  };
}
