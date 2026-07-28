import { redirect } from 'next/navigation';
import { getAllDocs } from '@/lib/docs';

export default function DocsIndex() {
  const docs = getAllDocs();
  
  if (docs.length > 0) {
    redirect(`/docs/${docs[0].slug}`);
  }
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-72px)]">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Documentation Center</h1>
        <p className="text-slate-500">No documentation pages found. Please create markdown files in the /docs directory.</p>
      </div>
    </div>
  );
}
