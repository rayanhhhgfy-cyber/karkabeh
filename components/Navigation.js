import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import LanguageSelector from './LanguageSelector';
import React from 'react';

export default function Navigation() {
  const { cart } = useCart();
  const router = useRouter();
  
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/products" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all">
            كركبة
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />
            <Link 
              href="/products" 
              className={`text-base font-medium hover:text-blue-600 transition-colors ${router.pathname === '/products' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
            >
              Products
            </Link>
            
            <Link 
              href="/cart" 
              className={`text-base font-medium hover:text-blue-600 transition-colors relative ${router.pathname === '/cart' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
            >
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <Link 
              href="/profile" 
              className={`text-base font-medium hover:text-blue-600 transition-colors ${router.pathname === '/profile' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
            >
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <div className="px-4 py-2">
                <LanguageSelector />
              </div>
              <Link 
                href="/products" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${router.pathname === '/products' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Products
              </Link>
              
              <Link 
                href="/cart" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors relative flex items-center justify-between ${router.pathname === '/cart' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              <Link 
                href="/profile" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${router.pathname === '/profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
