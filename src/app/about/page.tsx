import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About Gulf Beach Weddings</h1>
      <p className="mb-4 text-gray-700">
        Florida Gulf Beach Weddings provides beautiful and affordable destination beach wedding packages for all beach locations in Pinellas County, Sarasota County, Manatee County, Tampa Bay, and Destin. Our mission is to create a once-in-a-lifetime experience through the magic of a beach wedding.
      </p>
      <p className="mb-4 text-gray-700">
        Since 2011, we have officiated, photographed, coordinated, and organized 9,000+ destination weddings from Clearwater Beach to Siesta Key, Sarasota. Our team of wedding professionals can help with all of your wedding plans: intimate elopement, vow-renewal, small family wedding, large formal weddings, and commitment ceremonies.
      </p>
      <p className="mb-4 text-gray-700">
        We offer all-inclusive packages, preferred beach locations, and a full-service experience so you can focus on your big day. Let us take care of the details!
      </p>
      <nav className="mt-8 space-x-4">
        <Link href="/packages" className="text-blue-600 underline">Packages</Link>
        <Link href="/weddings" className="text-blue-600 underline">Weddings</Link>
        <Link href="/blog" className="text-blue-600 underline">Blog</Link>
        <Link href="/contact" className="text-blue-600 underline">Contact</Link>
      </nav>
    </main>
  );
} 