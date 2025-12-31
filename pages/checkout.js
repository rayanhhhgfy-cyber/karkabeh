import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../hooks/useToast';
import MapPicker from '../components/MapPicker';
import Head from 'next/head';

export default function Checkout() {
  const router = useRouter();
  const { cart, clearCart, getCartTotal } = useCart();
  const { t, language } = useLanguage();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    secondPhone: '',
    address: '',
    buildingName: '',
    buildingNumber: '',
    city: '',
    latitude: null,
    longitude: null,
    notes: ''
  });

  useEffect(() => {
    checkUser();
    loadSavedCustomerInfo();
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

  function loadSavedCustomerInfo() {
    const saved = localStorage.getItem('customerInfo');
    if (saved) {
      try {
        const customerInfo = JSON.parse(saved);
        setFormData(prev => ({
          ...prev,
          ...customerInfo,
          email: prev.email // Keep the user's email
        }));
      } catch (error) {
        console.error('Error loading saved customer info:', error);
      }
    }
  }

  function saveCustomerInfo() {
    const infoToSave = {
      fullName: formData.fullName,
      phone: formData.phone,
      secondPhone: formData.secondPhone,
      address: formData.address,
      buildingName: formData.buildingName,
      buildingNumber: formData.buildingNumber,
      city: formData.city
    };
    localStorage.setItem('customerInfo', JSON.stringify(infoToSave));
  }

  const totalAmount = getCartTotal();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleLocationSelect(location) {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation - all fields mandatory except notes and secondPhone
    if (!formData.fullName || !formData.phone || !formData.address || 
        !formData.buildingName || !formData.buildingNumber || !formData.city) {
      showToast(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields', 'error');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      showToast(language === 'ar' ? 'يرجى تحديد موقع التوصيل على الخريطة' : 'Please select delivery location on map', 'error');
      return;
    }

    setLoading(true);

    try {
      // Save customer info for next time
      saveCustomerInfo();

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
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            notes: formData.notes || null,
            total_amount: totalAmount,
            status: 'pending'
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
      
      // Show success toast
      showToast(language === 'ar' ? 'تم تقديم الطلب بنجاح!' : 'Order placed successfully!', 'success');
      
      // Redirect to order success page with animation
      setTimeout(() => {
        router.push(`/order-success?orderId=${order.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error placing order:', error);
      showToast(language === 'ar' ? 'خطأ في تقديم الطلب: ' + error.message : 'Error placing order: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{t('checkout')} - Karkabeh</title>
      </Head>

      <ToastContainer />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">{t('checkout')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-6">{t('customerInformation')}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>

                  {/* Phone Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phone')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+962 7X XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('secondPhone')}
                      </label>
                      <input
                        type="tel"
                        name="secondPhone"
                        value={formData.secondPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+962 7X XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">{t('deliveryInformation')}</h3>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'ar' ? 'اسم الشارع والرقم' : 'Street name and number'}
                    />
                  </div>

                  {/* Building Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('buildingName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="buildingName"
                        value={formData.buildingName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'اسم المبنى أو المجمع' : 'Building or complex name'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('buildingNumber')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="buildingNumber"
                        value={formData.buildingNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={language === 'ar' ? 'رقم المبنى' : 'Building number'}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('city')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'ar' ? 'اسم المدينة' : 'City name'}
                    />
                  </div>

                  {/* Map Location Selector */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      className="w-full px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formData.latitude ? (language === 'ar' ? 'تم تحديد الموقع ✓' : 'Location Selected ✓') : t('selectLocation')}
                    </button>
                    
                    {showMap && (
                      <div className="mt-4">
                        <MapPicker 
                          onLocationSelect={handleLocationSelect}
                          initialLocation={formData.latitude ? { lat: formData.latitude, lng: formData.longitude } : null}
                        />
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('deliveryNotes')}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'ar' ? 'أي تعليمات خاصة للتوصيل...' : 'Any special instructions for delivery...'}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-gray-800 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {language === 'ar' ? 'جاري تقديم الطلب...' : 'Placing Order...'}
                      </span>
                    ) : (
                      t('placeOrder')
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">{t('orderTotal')}</h2>
                
                <div className="space-y-3 mb-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toFixed(2)} {language === 'ar' ? 'دينار' : 'JD'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-blue-600">{totalAmount.toFixed(2)} {language === 'ar' ? 'دينار' : 'JD'}</span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-gray-500 space-y-2">
                  <p>✓ {language === 'ar' ? 'دفع آمن' : 'Secure checkout'}</p>
                  <p>✓ {language === 'ar' ? 'توصيل مجاني للطلبات فوق 100 دينار' : 'Free delivery on orders over 100 JD'}</p>
                  <p>✓ {language === 'ar' ? 'سياسة إرجاع لمدة 30 يوماً' : '30-day return policy'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
