import Link from 'next/link';

export default function WeddingsGalleryPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Real Weddings Gallery</h1>
      <p className="mb-4 text-gray-700">
        Explore our gallery of beautiful Gulf Coast weddings. Get inspired by real couples, stunning locations, and creative setups. Click any wedding to view its unique story and photos!
      </p>
      <nav className="mt-8 space-x-4">
        <Link href="/packages" className="text-blue-600 underline">Packages</Link>
        <Link href="/about" className="text-blue-600 underline">About</Link>
        <Link href="/contact" className="text-blue-600 underline">Contact</Link>
      </nav>
    </main>
  );
} 