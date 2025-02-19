'use client';

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} JobPortal. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/about" className="hover:text-white text-sm">
            About Us
          </a>
          <a href="/contact" className="hover:text-white text-sm">
            Contact
          </a>
          <a href="/privacy" className="hover:text-white text-sm">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
