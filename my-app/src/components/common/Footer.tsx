'use client';

import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-white p-6 mt-12">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} CryptoNews. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="/about" className="hover:text-zinc-400">About</a>
          <a href="/contact" className="hover:text-zinc-400">Contact</a>
          <a href="/privacy-policy" className="hover:text-zinc-400">Privacy Policy</a>
          <a href="/terms" className="hover:text-zinc-400">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
