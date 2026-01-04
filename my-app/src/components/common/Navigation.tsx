'use client';

import React from 'react';
import Link from 'next/link';

// Define the types for the navigation links
interface SubLink {
  name: string;
  path: string;
}

interface NavLink {
  name: string;
  path: string;
  subLinks?: SubLink[];
}

const navLinks: NavLink[] = [
  { name: 'Home', path: '/' },
  { name: 'Blogs', path: '/blogs' },
  { name: 'News', path: '/news' },
  { name: 'Prediction', path: '/prediction' },
];

export const Navigation = () => {
  return (
    <nav className="bg-zinc-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link href={link.path}>
                  <p className="hover:bg-zinc-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    {link.name}
                  </p>
                </Link>
                {link.subLinks && (
                  <div className="absolute left-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {link.subLinks.map((subLink) => (
                      <Link key={subLink.name} href={subLink.path}>
                        <p className="block px-4 py-2 text-sm text-white hover:bg-zinc-700">
                          {subLink.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
