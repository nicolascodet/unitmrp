import Link from 'next/link';

export default function Nav() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/parts" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Parts
            </Link>
            <Link href="/production-runs" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Production Runs
            </Link>
            <Link href="/quality-checks" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Quality Checks
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 