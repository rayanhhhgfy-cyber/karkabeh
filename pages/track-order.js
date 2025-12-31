import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
import Head from 'next/head';
import Link from 'next/link';

export default function TrackOrder() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  async function fetchOrder() {
    try {
      setLoading(true);
      
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Order error:', orderError);
        setOrder(null);
        setLoading(false);
        return;
      }
      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Items error:', itemsError);
      }

      // Fetch product details for each item
      if (itemsData && itemsData.length > 0) {
        const itemsWithProducts = await Promise.all(
          itemsData.map(async (item) => {
            const { data: productData } = await supabase
              .from('products')
              .select('name, description, image_url')
              .eq('id', item.product_id)
              .single();

            return {
              ...item,
              product: productData || { name: 'Unknown Product' },
              subtotal: item.quantity * item.price
            };
          })
        );
        setOrderItems(itemsWithProducts);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'collecting':
        return 'bg-blue-100 text-blue-800';
      case 'ready_to_ship':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'pending':
        return 'Order Received';
      case 'collecting':
        return 'Collecting Items';
      case 'ready_to_ship':
        return 'Ready to Ship';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
          <Link href="/products">
            <a className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Continue Shopping
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Track Order #{order.id.slice(0, 8)} - Karkabeh</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order #{order.id.slice(0, 8)}</h1>
                <p className="text-gray-600 text-sm mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            {/* Order Status Timeline */}
            <div className="mt-8">
              <div className="flex justify-between items-center">
                {['pending', 'collecting', 'ready_to_ship', 'shipped', 'delivered'].map((status, index) => {
                  const isActive = ['pending', 'collecting', 'ready_to_ship', 'shipped', 'delivered'].indexOf(order.status) >= index;
                  const isCurrent = order.status === status;
                  
                  return (
                    <div key={status} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}>
                          {isActive ? '✓' : index + 1}
                        </div>
                        <p className={`text-xs mt-2 text-center ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                          {getStatusText(status)}
                        </p>
                      </div>
                      {index < 4 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          isActive ? 'bg-blue-600' : 'bg-gray-200'
                        }`} style={{ zIndex: -1 }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                  <div>
                    <h3 className="font-medium text-gray-800">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">${item.subtotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium">{order.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.customer_phone || order.phone || 'N/A'}</p>
              </div>
              {order.customer_phone_2 && (
                <div>
                  <p className="text-sm text-gray-600">Second Phone</p>
                  <p className="font-medium">{order.customer_phone_2}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium">
                  {order.delivery_address || order.shipping_address || 'N/A'}
                  {order.building_name && `, ${order.building_name}`}
                  {order.building_number && ` #${order.building_number}`}
                  {order.city && `, ${order.city}`}
                  {order.postal_code && ` ${order.postal_code}`}
                </p>
              </div>
              {order.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Delivery Notes</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/products" className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Continue Shopping
            </Link>
            <Link href="/profile" className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
