import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Cart() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              كركبة
            </Link>
            <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <Link href="/products" className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Products
              </Link>
              <Link href="/cart" className="text-sm lg:text-base text-blue-600 font-bold">
                Cart ({getCartCount()})
              </Link>
              <Link href="/profile" className="text-sm lg:text-base text-gray-600 hover:text-blue-600 transition-colors font-medium">
                Profile
              </Link>
            </div>
            <div className="sm:hidden">
              <span className="text-sm font-semibold text-blue-600">Cart ({getCartCount()})</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-900">Shopping Cart</h1>
        
        {cart.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-5 lg:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                      <p className="text-lg sm:text-xl font-bold text-blue-600 mb-3">{item.price} JD</p>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all font-bold"
                        >
                          -
                        </button>
                        <span className="text-base sm:text-lg font-bold min-w-[30px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm sm:text-base transition-colors"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} JD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8 sticky top-24">
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-900">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">{getCartTotal().toFixed(2)} JD</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold text-gray-900">Included</span>
                  </div>
                </div>
                <div className="border-t-2 border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-xl sm:text-2xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{getCartTotal().toFixed(2)} JD</span>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Proceed to Checkout
                </button>
                <Link href="/products" className="block text-center mt-4 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 lg:p-16 text-center">
            <svg className="mx-auto h-20 w-20 sm:h-24 sm:w-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}