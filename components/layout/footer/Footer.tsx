import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/PaperTrailLogo.png" 
              alt="PaperTrail Logo" 
              width={48} 
              height={48}
              className="w-12 h-12"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link href="/timeline" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
              Timeline
            </Link>
            <Link href="/migration/new" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
              Start Migration
            </Link>
            <Link href="/migration/analysis" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
              Analysis
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © 2024 PaperTrail. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
