import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import { ShoppingBag, User as UserIcon, Heart, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
    loadCart();
    
    // Add event listener for cart updates
    window.addEventListener('cartUpdated', loadCart);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('cartUpdated', loadCart);
    };
  }, []);

  const checkUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem('karkabeh_cart');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    localStorage.removeItem('karkabeh_cart');
    setCartItems([]);
    window.location.href = createPageUrl("Home"); // Redirect to login page on logout
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

  if (currentPageName === "Home") {
    return <>{children}</>; // Render only the login page without the layout
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <style>
        {`
          :root {
            --primary-navy: #1A202C;
            --primary-gray: #4A5568;
            --accent-blue: #3182CE;
            --warm-white: #F7FAFC;
          }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--warm-white);
          }
        `}
      </style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl("Products")} className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-gray-800 bg-clip-text text-transparent">
                كركبة
              </div>
              <div className="text-xs text-gray-600 hidden sm:block">Karkabeh</div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to={createPageUrl("Products")} 
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  currentPageName === "Products" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                المتجر
              </Link>
              <Link 
                to={createPageUrl("ProductRequest")} 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                اطلب منتج
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to={createPageUrl("AdminDashboard")} 
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
              <Link to={createPageUrl("Cart")}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-blue-500 hover:bg-blue-600"
                    >
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserIcon className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("MyOrders")}>طلباتي</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("ChangePassword")}>تغيير كلمة المرور</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>تسجيل الخروج</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => User.login()} 
                  variant="outline" 
                  size="sm"
                  className="border-gray-300 text-gray-800 hover:bg-gray-100"
                >
                  تسجيل الدخول
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col gap-4">
                <Link 
                  to={createPageUrl("Products")} 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  المتجر
                </Link>
                <Link 
                  to={createPageUrl("ProductRequest")} 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  اطلب منتج
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to={createPageUrl("AdminDashboard")} 
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
      {(currentPageName === "Products") && (
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={createPageUrl(`Products?category=${category.name}`)}
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
                <li><Link to={createPageUrl("Products?category=suits")} className="hover:text-white transition-colors">بدل</Link></li>
                <li><Link to={createPageUrl("Products?category=shirts")} className="hover:text-white transition-colors">قمصان</Link></li>
                <li><Link to={createPageUrl("Products?category=shoes")} className="hover:text-white transition-colors">أحذية</Link></li>
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
