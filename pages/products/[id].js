import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function ProductDetail({ product, reviews }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Product not found</p>
        <Link href="/products" className="text-blue-600 hover:underline">Back to Products</Link>
      </div>
    );
  }

  const images = product.images || [product.image_url];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product.rating || 0;

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    alert(`Added ${quantity} x ${product.name} to cart!`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    // TODO: Implement review submission
    alert('Review submitted! (Feature coming soon)');
    setReviewText('');
    setReviewerName('');
    setRating(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-xs sm:text-sm text-gray-600 flex items-center flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="mb-4 rounded-xl overflow-hidden bg-white shadow-lg">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === idx ? 'border-blue-600 shadow-md scale-105' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-16 sm:h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      star <= averageRating ? 'fill-current' : 'fill-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-sm sm:text-base text-gray-600">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed">{product.description}</p>
            
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              {product.price} <span className="text-2xl sm:text-3xl">JD</span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-semibold text-sm sm:text-base">
                    In Stock ({product.stock} available)
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-red-50 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 font-semibold text-sm sm:text-base">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700">Quantity:</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all font-bold text-lg"
                >
                  -
                </button>
                <span className="text-xl sm:text-2xl font-bold text-gray-900 min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed mb-3 sm:mb-4 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <Link href="/products">
              <button className="w-full border-2 border-gray-300 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-50 hover:border-gray-400 transition-all">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>

      {/* Reviews Section */}
      <div className="border-t pt-8 sm:pt-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8">Customer Reviews</h2>
        
        {/* Review Form */}
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8 mb-8">
          <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4 sm:mb-5">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Your Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="mb-4 sm:mb-5">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Rating</label>
              <div className="flex space-x-2 sm:space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl sm:text-4xl transition-transform hover:scale-110"
                  >
                    <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-5 sm:mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                rows="4"
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Submit Review
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 sm:space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`text-lg ${star <= review.rating ? '' : 'text-gray-300'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-bold text-gray-900 text-sm sm:text-base sm:ml-3">{review.user_name || 'Anonymous'}</span>
                  <span className="text-xs sm:text-sm text-gray-500 sm:ml-3">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
              <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-gray-500 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { props: { product: null, reviews: [] } };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    // Fetch reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', params.id)
      .order('created_at', { ascending: false });

    if (productError) console.error('Product error:', productError);
    if (reviewsError) console.error('Reviews error:', reviewsError);

    return {
      props: {
        product: product || null,
        reviews: reviews || []
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        product: null,
        reviews: []
      }
    };
  }
}
