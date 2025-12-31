import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function OrderDetailsModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  async function loadOrderDetails() {
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
            .select('name, image_url')
            .eq('id', item.product_id)
            .single();
          return { ...item, product };
        })
      );

      setOrderItems(itemsWithProducts);
    } catch (error) {
      console.error('Error loading order details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        ) : order ? (
          <div className="p-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order ID:</span> {order.id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'ready_to_ship' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'collecting' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p><span className="font-medium">Total:</span> {order.total_amount?.toFixed(2)} JD</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {order.customer_name || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {order.customer_email || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {order.customer_phone || 'N/A'}</p>
                  <p><span className="font-medium">Second Phone:</span> {order.second_phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Delivery Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Address:</span> {order.delivery_address || order.shipping_address || 'N/A'}</p>
                <p><span className="font-medium">Building:</span> {order.building_name || 'N/A'} #{order.building_number || 'N/A'}</p>
                <p><span className="font-medium">City:</span> {order.city || 'N/A'}</p>
                {order.location_lat && order.location_lng && (
                  <p><span className="font-medium">Location:</span> {order.location_lat}, {order.location_lng}</p>
                )}
                {order.delivery_notes && (
                  <p><span className="font-medium">Notes:</span> {order.delivery_notes}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product?.name}
                                className="w-12 h-12 object-cover rounded mr-3"
                              />
                            )}
                            <span className="text-sm font-medium">{item.product?.name || 'Unknown Product'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">{item.price?.toFixed(2)} JD</td>
                        <td className="px-4 py-3 text-sm font-semibold">{(item.quantity * item.price)?.toFixed(2)} JD</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-right font-semibold">Total:</td>
                      <td className="px-4 py-3 font-bold text-lg">{order.total_amount?.toFixed(2)} JD</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-600">
            Order not found
          </div>
        )}
      </div>
    </div>
  );
}
