import Link from 'next/link';

export default function PackagesPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Wedding Packages</h1>
      <p className="mb-4 text-gray-700">
        Choose from our all-inclusive Florida beach wedding packages, designed for every group size and budget. Customize your ceremony with a variety of flower decorations, chair sashes, arches, music, and more. Let us help you create your dream wedding on the Gulf Coast!
      </p>
      <nav className="mt-8 space-x-4">
        <Link href="/weddings" className="text-blue-600 underline">Weddings</Link>
        <Link href="/about" className="text-blue-600 underline">About</Link>
        <Link href="/contact" className="text-blue-600 underline">Contact</Link>
      </nav>
    </main>
  );
} 