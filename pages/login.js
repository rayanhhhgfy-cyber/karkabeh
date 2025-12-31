import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

export default function Login() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleGoogleLogin() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/products`
        }
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  }



  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Check if admin
        if (email === 'admin2211@gmail.com' || email === 'admin@gmail.com') {
          setMessage('Admin login successful! Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/admin/dashboard');
          }, 1000);
        } else {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/products');
          }, 1000);
        }
      } else {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (authError) throw authError;
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email,
            full_name: fullName,
            role: 'customer',
            created_at: new Date().toISOString()
          }]);
        
        if (profileError) throw profileError;
        
        setMessage('Account created successfully! Please check your email to verify your account.');
        setIsLogin(true);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
      {/* Language Selector - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-gray-800 bg-clip-text text-transparent mb-2">
            كركبة
          </h1>
          <p className="text-gray-600">Karkabeh - Premium Men's Fashion</p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? t('welcomeBack') : t('signUp')}
            </h2>
            <p className="text-gray-600">
              {isLogin ? (language === 'ar' ? 'سجل الدخول لمتابعة التسوق' : 'Sign in to continue shopping') : (language === 'ar' ? 'انضم إلينا اليوم' : 'Join us today')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-gray-800 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : (isLogin ? t('signIn') : t('signUp'))}
            </button>
          </form>

          {/* OAuth Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('orContinueWith')}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? t('dontHaveAccount') + ' ' + t('signUp') : t('alreadyHaveAccount') + ' ' + t('signIn')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/products" className="text-gray-600 hover:text-gray-800 text-sm">
              {t('continueAsGuest')} →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 Karkabeh. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
