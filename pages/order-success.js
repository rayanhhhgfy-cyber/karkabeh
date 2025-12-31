import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId } = router.query;
  const { t, language } = useLanguage();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  async function fetchOrderDetails() {
    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Fetch product details for each item
      const itemsWithProducts = await Promise.all(
        itemsData.map(async (item) => {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.product_id)
            .single();
          return { ...item, product };
        })
      );

      setOrderItems(itemsWithProducts);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">{t('orderNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push('/profile')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {language === 'ar' ? 'عودة إلى الملف الشخصي' : 'Back to Profile'}
        </button>
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block animate-bounce">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('orderPlaced')}</h1>
          <p className="text-lg text-gray-600 mb-2">{language === 'ar' ? 'شكراً لطلبك!' : 'Thank you for your order!'}</p>
          <p className="text-md text-gray-600 mb-4">{language === 'ar' ? 'سنتواصل معك قريباً لتأكيد الطلب. يمكنك تتبع طلبك من سجل الطلبات.' : 'We will contact you shortly to confirm your order. You can track your order from the order history.'}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">{t('orderNumber')}</p>
            <p className="text-xl font-mono font-bold text-blue-600">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">{t('orderDetails')}</h2>
          
          {/* Order Status */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('orderStatus')}</p>
                <p className="text-lg font-semibold text-blue-600 capitalize">{order.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('orderTotal')}</p>
                <p className="text-2xl font-bold text-gray-900">{order.total_amount} {language === 'ar' ? 'دينار' : 'JD'}</p>
              </div>
            </div>
          </div>

          {/* Products Ordered */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{language === 'ar' ? 'المنتجات المطلوبة' : 'Products Ordered'}</h3>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {item.product?.image_url && (
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.product?.name}</h4>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'الكمية' : 'Quantity'}: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.price} {language === 'ar' ? 'دينار' : 'JD'}</p>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'لكل قطعة' : 'each'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold mb-4">{t('deliveryAddress')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">{order.customer_name}</p>
              <p className="text-gray-600">{order.phone}</p>
              {order.second_phone && <p className="text-gray-600">{order.second_phone}</p>}
              <p className="text-gray-600 mt-2">{order.address}</p>
              {order.building_name && <p className="text-gray-600">{order.building_name} #{order.building_number}</p>}
              <p className="text-gray-600">{order.city}</p>
              {order.delivery_notes && (
                <p className="text-gray-600 mt-2 italic">{language === 'ar' ? 'ملاحظات' : 'Notes'}: {order.delivery_notes}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/track-order?orderId=${order.id}`)}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {t('trackOrder')}
            </button>
            <button
              onClick={() => router.push('/products')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              {t('continueShopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
