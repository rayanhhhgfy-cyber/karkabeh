import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  Users,
  Shield,
  Search,
  Star,
  Code
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', user.id)
        .single();

      if (error || !userData || userData.role !== 'admin') {
        // Check if email is admin email
        if (user.email !== 'admin2211@gmail.com' && user.email !== 'admin@gmail.com') {
          alert('Access denied. Admin only.');
          router.push('/products');
          return;
        }
      }

      setUser(user);
      await loadStats();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  }

  async function loadStats() {
    try {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');

      const revenue = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        totalRevenue: revenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  async function handleResetRevenue() {
    if (!confirm('Are you sure you want to reset total revenue to zero? This action cannot be undone.')) {
      return;
    }

    try {
      // Update all orders to set total_amount to 0
      const { error } = await supabase
        .from('orders')
        .update({ total_amount: 0 })
        .neq('id', 0); // Update all records

      if (error) throw error;

      alert('Total revenue has been reset successfully!');
      await loadStats(); // Reload stats
    } catch (error) {
      console.error('Error resetting revenue:', error);
      alert('An error occurred while resetting revenue');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleResetRevenue}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Reset Revenue
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link href="/admin/dashboard" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2">
              Dashboard
            </Link>
            <Link href="/admin/products" className="text-gray-600 hover:text-blue-600 pb-2">
              Products
            </Link>
            <Link href="/admin/orders" className="text-gray-600 hover:text-blue-600 pb-2">
              Orders
            </Link>
            <Link href="/admin/reviews" className="text-gray-600 hover:text-blue-600 pb-2">
              Reviews
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-blue-600 pb-2">
              View Store
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Panel</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-500" />
                <span>Product Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Add, edit, or delete products in your store.</p>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full">Go to Product Management</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-green-500" />
                <span>Order Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and update incoming order statuses.</p>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full">Go to Order Management</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-500" />
                <span>User Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View list of registered users in the store.</p>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">Go to User Management</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Search className="w-6 h-6 text-orange-500" />
                <span>Product Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View customer requests for unavailable products.</p>
              <Link href="/admin/product-requests">
                <Button variant="outline" className="w-full">View Requests</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Review Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and delete customer reviews on products.</p>
              <Link href="/admin/reviews">
                <Button variant="outline" className="w-full">View Reviews</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Code className="w-6 h-6 text-indigo-500" />
                <span>View Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View code for all pages, components, and entities.</p>
              <Link href="/admin/code-viewer">
                <Button variant="outline" className="w-full">View Code</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
