// Admin Users Management Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetchUsers();
  }, []);

  const checkAdminAndFetchUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        // Fallback: Check if email is admin email
        if (user.email !== 'admin2211@gmail.com' && user.email !== 'admin@gmail.com') {
          router.push('/');
          return;
        }
      }

      setIsAdmin(true);
      await fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
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
              <Users className="w-6 h-6" />
              <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
            </div>
            <p className="text-gray-600 mt-2">عدد المستخدمين: {users.length}</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3">الاسم الأول</th>
                    <th className="text-right p-3">الاسم الأخير</th>
                    <th className="text-right p-3">البريد الإلكتروني</th>
                    <th className="text-right p-3">رقم الهاتف</th>
                    <th className="text-right p-3">العنوان</th>
                    <th className="text-right p-3">الدور</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{user.first_name || 'غير محدد'}</td>
                      <td className="p-3">{user.last_name || 'غير محدد'}</td>
                      <td className="p-3">{user.email || 'غير محدد'}</td>
                      <td className="p-3">{user.phone || 'غير محدد'}</td>
                      <td className="p-3">{user.address || 'غير محدد'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}