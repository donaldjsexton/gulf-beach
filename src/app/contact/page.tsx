import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-4 text-gray-700">
        Have questions or want to book your dream beach wedding? Reach out to our team!
      </p>
      <div className="mb-4">
        <p className="font-semibold">Phone:</p>
        <p>(727) 475-2272</p>
        <p className="font-semibold mt-2">Email:</p>
        <p><a href="mailto:info@gulfbeachweddings.com" className="text-blue-600 underline">info@gulfbeachweddings.com</a></p>
        <p className="font-semibold mt-2">Offices:</p>
        <p>211 14th St N, St Petersburg, FL 33705</p>
        <p>209 Main St, Destin, FL 32541</p>
      </div>
      <nav className="mt-8 space-x-4">
        <Link href="/about" className="text-blue-600 underline">About</Link>
        <Link href="/packages" className="text-blue-600 underline">Packages</Link>
        <Link href="/weddings" className="text-blue-600 underline">Weddings</Link>
      </nav>
    </main>
  );
} 