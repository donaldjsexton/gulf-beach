"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function PageEditor() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(true);
  const [editorData, setEditorData] = useState<any>(null);

  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("pages")
        .select("id, slug, title, content, published")
        .eq("slug", slug)
        .single();
      if (error) {
        setError("Page not found");
        setLoading(false);
        return;
      }
      setPage(data);
      setTitle(data.title);
      setPublished(data.published);
      setEditorData(data.content);
      setLoading(false);
    }
    fetchPage();
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const content = editorData;
    const { error } = await supabase
      .from("pages")
      .update({
        title,
        published,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", page.id);
    setSaving(false);
    if (error) {
      setError("Failed to save page");
    } else {
      router.refresh();
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Page: {slug}</h1>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Title</label>
        <input
          className="w-full border px-3 py-2 rounded mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <label className="block font-semibold mb-1">Published</label>
        <input
          type="checkbox"
          checked={published}
          onChange={e => setPublished(e.target.checked)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Content</label>
        <Editor
          data={editorData}
          onChange={setEditorData}
        />
      </div>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Page"}
      </button>
    </main>
  );
} 