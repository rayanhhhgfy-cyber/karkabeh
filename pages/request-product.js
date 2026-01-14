import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function RequestProduct({ initialLanguage }) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage || 'ar');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product_name: '',
    description: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('product_requests')
        .insert([
          {
            ...formData,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'ar' 
          ? 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.' 
          : 'Your request has been submitted successfully! We will contact you soon.'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        product_name: '',
        description: '',
        image_url: ''
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage({
        type: 'error',
        text: language === 'ar'
          ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while submitting your request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const content = {
    ar: {
      title: 'اطلب منتج',
      subtitle: 'لم تجد ما تبحث عنه؟ أخبرنا عن المنتج الذي تريده وسنحاول توفيره لك',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      productName: 'اسم المنتج المطلوب',
      description: 'وصف المنتج',
      imageUrl: 'رابط صورة المنتج (اختياري)',
      submit: 'إرسال الطلب',
      submitting: 'جاري الإرسال...'
    },
    en: {
      title: 'Request a Product',
      subtitle: "Couldn't find what you're looking for? Tell us about the product you want and we'll try to get it for you",
      name: 'Name',
      email: 'Email',
      phone: 'Phone Number',
      productName: 'Product Name',
      description: 'Product Description',
      imageUrl: 'Product Image URL (optional)',
      submit: 'Submit Request',
      submitting: 'Submitting...'
    }
  };

  const t = content[language];

  return (
    <Layout language={language} setLanguage={setLanguage}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {t.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {t.subtitle}
              </p>
            </div>

            {message.text && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                } animate-fadeIn`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.name} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t.name}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t.email}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t.phone}
                />
              </div>

              <div>
                <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  id="product_name"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t.productName}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.description} *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder={t.description}
                />
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.imageUrl}
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                {loading ? t.submitting : t.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      initialLanguage: 'ar'
    }
  };
}
