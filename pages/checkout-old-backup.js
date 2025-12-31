import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import Head from 'next/head';

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    secondPhone: '',
    address: '',
    buildingName: '',
    buildingNumber: '',
    city: '',
    postalCode: '',
    latitude: null,
    longitude: null,
    notes: ''
  });

  useEffect(() => {
    checkUser();
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUser(user);
    setFormData(prev => ({
      ...prev,
      email: user.email || ''
    }));
  }

  const totalAmount = getCartTotal();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function selectLocation() {
    // Open map modal for location selection
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          alert(`Location selected: ${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          alert('Unable to get your location. Please enter address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.phone || !formData.address || !formData.buildingName || !formData.buildingNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_phone_2: formData.secondPhone || null,
            delivery_address: formData.address,
            building_name: formData.buildingName,
            building_number: formData.buildingNumber,
            city: formData.city || null,
            postal_code: formData.postalCode || null,
            latitude: formData.latitude,
            longitude: formData.longitude,
            notes: formData.notes || null,
            total_amount: totalAmount,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      clearCart();
      
      // Redirect to order tracking page
      alert('Order placed successfully!');
      router.push(`/track-order?orderId=${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Checkout - Karkabeh</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">Delivery Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder="your@email.com"
                      readOnly
                    />
                  </div>

                  {/* Phone Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+962 7X XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Second Phone Number
                      </label>
                      <input
                        type="tel"
                        name="secondPhone"
                        value={formData.secondPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+962 7X XXX XXXX (Optional)"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Street name and number"
                    />
                  </div>

                  {/* Building Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Building or complex name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="buildingNumber"
                        value={formData.buildingNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Building number"
                      />
                    </div>
                  </div>

                  {/* City and Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="City name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  {/* Location Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location on Map
                    </label>
                    <button
                      type="button"
                      onClick={selectLocation}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formData.latitude ? 'Location Selected ✓' : 'Select Location on Map'}
                    </button>
                    {formData.latitude && (
                      <p className="text-sm text-green-600 mt-2">
                        📍 Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-gray-800 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                  <p>✓ Secure checkout</p>
                  <p>✓ Free delivery on orders over $100</p>
                  <p>✓ 30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
