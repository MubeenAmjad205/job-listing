'use client';

import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link href="github.com/MubeeneAmjad205" className="hover:text-white text-sm">
            About Us
          </Link>
          <Link href="https://wa.me/+923084045205" className="hover:text-white text-sm">
            Contact
          </Link>
          <Link href="/" className="hover:text-white text-sm">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
