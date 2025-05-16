import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

interface Page {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  updated_at: string;
}

export default function AdminPagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('id, slug, title, published, updated_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      setError('Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Pages</h1>
      <div className="mb-4">
        <Link href="/admin/pages/new" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">+ New Page</Link>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Slug</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Updated</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b">
                <td className="px-4 py-2">{page.title}</td>
                <td className="px-4 py-2">{page.slug}</td>
                <td className="px-4 py-2">{page.published ? 'Published' : 'Draft'}</td>
                <td className="px-4 py-2">{new Date(page.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/pages/${page.slug}`} className="text-blue-600 underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
} 