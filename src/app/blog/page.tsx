import Link from 'next/link';

export default function BlogPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Gulf Beach Weddings Blog</h1>
      <p className="mb-4 text-gray-700">
        Tips, inspiration, and stories from the Gulf Coast's leading beach wedding team. Read our latest guides, real wedding features, and planning advice.
      </p>
      <nav className="mt-8 space-x-4">
        <Link href="/weddings" className="text-blue-600 underline">Weddings</Link>
        <Link href="/about" className="text-blue-600 underline">About</Link>
        <Link href="/contact" className="text-blue-600 underline">Contact</Link>
      </nav>
    </main>
  );
} 