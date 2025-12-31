import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });

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

      setUser(user);
      await loadProfile(user.id);
      await loadOrders(user.id);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  }

  async function loadProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          ...formData
        });

      if (error) throw error;
      
      alert('Profile updated successfully!');
      setEditing(false);
      await loadProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-blue-600 hover:text-blue-800">
                Continue Shopping
              </Link>
              <Link href="/cart" className="text-blue-600 hover:text-blue-800">
                Cart
              </Link>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="text-lg font-medium">{profile?.first_name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="text-lg font-medium">{profile?.last_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-lg font-medium">{profile?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-lg font-medium">{profile?.address || 'Not set'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
              {orders.length === 0 ? (
                <p className="text-gray-500">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total_amount}</p>
                          <p className="text-sm text-gray-500 capitalize">{order.status || 'pending'}</p>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="space-y-3 border-t pt-3">
                          {order.order_items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                              {/* Product Image */}
                              {item.products?.image_url && (
                                <img 
                                  src={item.products.image_url} 
                                  alt={item.products.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              
                              {/* Product Details */}
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.products?.name}</p>
                                <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                              
                              {/* Price */}
                              <div className="text-right">
                                <p className="font-medium text-sm">${item.price}</p>
                                <p className="text-xs text-gray-500">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Track Order Button */}
                      <div className="mt-4 pt-3 border-t">
                        <button
                          onClick={() => router.push(`/track-order?orderId=${order.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Track Order →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  Browse Products
                </Link>
                <Link
                  href="/cart"
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  View Cart
                </Link>
                {(user?.email === 'admin2211@gmail.com' || user?.email === 'admin@gmail.com' || profile?.role === 'admin') && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 text-purple-600 hover:bg-purple-50 rounded"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
