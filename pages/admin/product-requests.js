// Admin Product Requests Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default function ProductRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetchRequests();
  }, []);

  const checkAdminAndFetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/');
        return;
      }

      setIsAdmin(true);
      await fetchRequests();
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('product_requests')
        .select('*, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <a className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              العودة للوحة التحكم
            </a>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6" />
              <h1 className="text-2xl font-bold">طلبات المنتجات</h1>
            </div>
            <p className="text-gray-600 mt-2">عدد الطلبات: {requests.length}</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات حاليا</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="bg-white border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">اسم المنتج</p>
                        <p className="font-semibold">{request.product_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">العلامة التجارية</p>
                        <p className="font-semibold">{request.brand || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الفئة</p>
                        <p className="font-semibold">{request.category || 'غير محدد'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المستخدم</p>
                        <p className="font-semibold">
                          {request.profiles?.first_name} {request.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{request.profiles?.email}</p>
                      </div>
                      {request.description && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600">الوصف</p>
                          <p className="font-semibold">{request.description}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">تاريخ الطلب</p>
                        <p className="text-sm">{new Date(request.created_at).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
