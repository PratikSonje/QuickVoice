import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-lg mx-auto">
        <p className="text-7xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
          404
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Browse Blog
          </Link>
          <Link
            href="/company/contact"
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
