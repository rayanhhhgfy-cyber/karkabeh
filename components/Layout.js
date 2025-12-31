import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";
import { ShoppingBag, User as UserIcon, Menu, X, Shield } from "lucide-react";

export default function Layout({ children, user }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [cartItems, setCartItems] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
    loadCart();
    
    // Add event listener for cart updates
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', loadCart);
      return () => {
        window.removeEventListener('cartUpdated', loadCart);
      };
    }
  }, [user]);

  const loadCart = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('karkabeh_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('karkabeh_cart');
    }
    setCartItems([]);
    router.push('/');
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const categories = [
    { name: "suits", label: "بدل", icon: "👔" },
    { name: "shirts", label: "قمصان", icon: "👕" },
    { name: "trousers", label: "بناطيل", icon: "👖" },
    { name: "outerwear", label: "جاكيتات", icon: "🧥" },
    { name: "shoes", label: "أحذية", icon: "👞" },
    { name: "watches", label: "ساعات", icon: "⌚" },
  ];

  // Don't show layout on login page
  if (router.pathname === '/' || router.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/products" className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-gray-800 bg-clip-text text-transparent">
                كركبة
              </div>
              <div className="text-xs text-gray-600 hidden sm:block">Karkabeh</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/products" 
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  router.pathname === "/products" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                المتجر
              </Link>
              <Link 
                href="/product-request" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                اطلب منتج
              </Link>
              {currentUser?.role === 'admin' && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  <Shield className="w-4 h-4" />
                  الإدارة
                </Link>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <Link href="/cart">
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* User Menu */}
              {currentUser ? (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium">{currentUser.email}</p>
                    </div>
                    <Link href="/my-orders" className="block px-4 py-2 text-sm hover:bg-gray-50">
                      طلباتي
                    </Link>
                    <Link href="/change-password" className="block px-4 py-2 text-sm hover:bg-gray-50">
                      تغيير كلمة المرور
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t border-gray-200"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    تسجيل الدخول
                  </button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col gap-4">
                <Link 
                  href="/products" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  المتجر
                </Link>
                <Link 
                  href="/product-request" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  اطلب منتج
                </Link>
                {currentUser?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-1 text-sm font-medium text-purple-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    لوحة الإدارة
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Category Pills */}
      {router.pathname === "/products" && (
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name}`}
                  className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-blue-100 to-gray-100 text-blue-800 rounded-full text-sm font-medium hover:from-blue-200 hover:to-gray-200 transition-all duration-200"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-200">كركبة</h3>
              <p className="text-gray-300 text-sm">
                متجرك الأول للأزياء الرجالية العصرية في الأردن
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-blue-200">تسوق</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/products?category=suits" className="hover:text-white transition-colors">بدل</Link></li>
                <li><Link href="/products?category=shirts" className="hover:text-white transition-colors">قمصان</Link></li>
                <li><Link href="/products?category=shoes" className="hover:text-white transition-colors">أحذية</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-blue-200">خدمة العملاء</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>الدفع عند الاستلام</li>
                <li>توصيل سريع</li>
                <li>إرجاع مجاني</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-blue-200">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📞 +962 6 123 4567</li>
                <li>📧 info@karkabeh.jo</li>
                <li>📍 عمان، الأردن</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 كركبة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
