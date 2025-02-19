// components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';

const Header = () => {
  const { user, logout, isLoading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex-shrink-0">
          <Link href="/">
            <span className="text-2xl font-bold text-indigo-600 cursor-pointer">
              JobPortal
            </span>
          </Link>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link href="/">
            <span className="text-gray-700 hover:text-indigo-600 cursor-pointer">Home</span>
          </Link>
          <Link href="/jobs">
            <span className="text-gray-700 hover:text-indigo-600 cursor-pointer">Jobs</span>
          </Link>
          {user && (
            <Link href={`${user.role==="admin"?'/dashboard/admin':"/dashboard/user"}`}>
              <span className="text-gray-700 hover:text-indigo-600 cursor-pointer">Dashboard</span>
            </Link>
          )}
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? null : user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/auth/login">
                <span className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer">
                  Login
                </span>
              </Link>
              <Link href="/auth/register">
                <span className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer">
                  Sign Up
                </span>
              </Link>
            </>
          )}
        </div>
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/">
              <span
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-indigo-600 cursor-pointer"
              >
                Home
              </span>
            </Link>
            <Link href="/jobs">
              <span
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-indigo-600 cursor-pointer"
              >
                Jobs
              </span>
            </Link>
            {user && (
              <Link href="/user/dashboard">
                <span
                  onClick={() => setMenuOpen(false)}
                  className="block text-gray-700 hover:text-indigo-600 cursor-pointer"
                >
                  Dashboard
                </span>
              </Link>
            )}
            <div className="mt-2">
              {user ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <span
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer"
                    >
                      Login
                    </span>
                  </Link>
                  <Link href="/auth/register">
                    <span
                      onClick={() => setMenuOpen(false)}
                      className="block mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
