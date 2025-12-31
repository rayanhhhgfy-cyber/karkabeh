import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../components/Navigation';
import Toast from '../components/Toast';

export default function Products({ initialProducts, initialCategories }) {
  const [products] = useState(initialProducts || []);
  const [loading] = useState(false);
  const [categories] = useState(initialCategories || []);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { addToCart } = useCart();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <Toast 
        message={toastMessage} 
        show={showToast} 
        onClose={() => setShowToast(false)} 
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
              Premium Men's Fashion
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Discover our curated collection of high-quality clothing and accessories
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Products Count */}
        {!loading && products.length > 0 && (
          <div className="mb-6 md:mb-8">
            <p className="text-sm sm:text-base text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> products
            </p>
          </div>
        )}
      
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                  {product.image_url && (
                    <div className="relative h-56 sm:h-64 lg:h-72 w-full bg-gray-100 overflow-hidden">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {product.price} <span className="text-base sm:text-lg text-gray-600">JD</span>
                      </p>
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="text-xs text-orange-600 font-medium">
                          Only {product.stock} left
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16 sm:h-20 sm:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products available</h3>
            <p className="text-sm sm:text-base text-gray-600">Check back soon for new arrivals!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return {
        props: {
          initialProducts: [],
          initialCategories: []
        }
      };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (productsError) console.error('Products error:', productsError);
    if (categoriesError) console.error('Categories error:', categoriesError);

    return {
      props: {
        initialProducts: products || [],
        initialCategories: categories || []
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialProducts: [],
        initialCategories: []
      }
    };
  }
}
