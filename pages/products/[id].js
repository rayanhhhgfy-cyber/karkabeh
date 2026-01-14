import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import Navigation from '../../components/Navigation';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Toast from '../../components/Toast';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    customer_name: '',
    rating: 5,
    comment: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      showToast('Error loading product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.customer_name.trim() || !reviewForm.comment.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: id,
          customer_name: reviewForm.customer_name,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        }]);

      if (error) throw error;

      showToast('Review submitted successfully!', 'success');
      setReviewForm({ customer_name: '', rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Error submitting review', 'error');
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product);
      showToast('Added to cart!', 'success');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`w-5 h-5 ${interactive ? 'cursor-pointer' : ''} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <button
            onClick={() => router.push('/products')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/products')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {language === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold">
                    {t('outOfStock')}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-4">
                {renderStars(Math.round(averageRating))}
                <span className="text-gray-600">
                  {averageRating} ({reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'})
                </span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  {product.price} <span className="text-2xl text-gray-600">JD</span>
                </p>
                {product.stock > 0 && product.stock < 10 && (
                  <p className="text-orange-600 font-medium mt-2">
                    {t('onlyXLeft').replace('{count}', product.stock)}
                  </p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-lg"
              >
                {product.stock === 0 ? t('outOfStock') : t('addToCart')}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'التقييمات' : 'Customer Reviews'}
          </h2>

          <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'ar' ? 'اكتب تقييمك' : 'Write a Review'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {language === 'ar' ? 'الاسم' : 'Name'}
              </label>
              <input
                type="text"
                value={reviewForm.customer_name}
                onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {language === 'ar' ? 'التقييم' : 'Rating'}
              </label>
              {renderStars(reviewForm.rating, true, (rating) => setReviewForm({ ...reviewForm, rating }))}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                {language === 'ar' ? 'التعليق' : 'Comment'}
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
            </button>
          </form>

          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.customer_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                {language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
              </p>
            )}
          </div>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
