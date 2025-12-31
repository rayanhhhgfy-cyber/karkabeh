import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../supabaseClient';
import Link from 'next/link';
import { useToast } from '../../hooks/useToast';

export default function AdminProducts() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: 0,
    sizes: [],
    colors: [],
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is admin
      if (user.email !== 'admin2211@gmail.com' && user.email !== 'admin@gmail.com') {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!userData || userData.role !== 'admin') {
          showToast('Access denied. Admin only.', 'error');
          router.push('/products');
          return;
        }
      }

      setUser(user);
      await loadProducts();
      await loadCategories();
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    }
  }

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function handleImageUpload(files) {
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast(`Failed to upload ${file.name}`, 'error');
      }
    }

    return uploadedUrls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload images if any
      let imageUrls = formData.images || [];
      if (imageFiles.length > 0) {
        const newUrls = await handleImageUpload(imageFiles);
        imageUrls = [...imageUrls, ...newUrls];
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        stock: parseInt(formData.stock) || 0,
        sizes: formData.sizes,
        colors: formData.colors,
        images: imageUrls
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        showToast('Product updated successfully!', 'success');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        showToast('Product added successfully!', 'success');
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: 0,
        sizes: [],
        colors: [],
        images: []
      });
      setImageFiles([]);
      setShowAddModal(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Failed to save product: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      showToast('Product deleted successfully!', 'success');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Failed to delete product', 'error');
    }
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category_id: product.category_id || '',
      stock: product.stock || 0,
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || []
    });
    setShowAddModal(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Product Management</h1>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="text-sm sm:text-base text-gray-600 truncate max-w-[150px] sm:max-w-none">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 sm:space-x-8 py-3 sm:py-4 scrollbar-hide">
            <Link href="/admin/dashboard" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 pb-2 whitespace-nowrap transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/products" className="text-sm sm:text-base text-blue-600 font-semibold border-b-2 border-blue-600 pb-2 whitespace-nowrap">
              Products
            </Link>
            <Link href="/admin/orders" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 pb-2 whitespace-nowrap transition-colors">
              Orders
            </Link>
            <Link href="/products" className="text-sm sm:text-base text-gray-600 hover:text-blue-600 pb-2 whitespace-nowrap transition-colors">
              View Store
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                category_id: '',
                stock: 0,
                sizes: [],
                colors: [],
                images: []
              });
              setImageFiles([]);
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center shadow-lg transition-all text-sm sm:text-base"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Product
          </button>
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Images
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{product.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${product.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock === 0 ? 'bg-red-100 text-red-800' : 
                      product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.stock || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.images?.length || 0} images</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-900 mr-4 font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900 font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">${product.price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Stock</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.stock === 0 ? 'bg-red-100 text-red-800' : 
                    product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {product.stock || 0}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Images</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{product.images?.length || 0}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images (Multiple)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImageFiles(Array.from(e.target.files))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      You can select multiple images. {imageFiles.length} file(s) selected.
                    </p>
                    {formData.images && formData.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Current images: {formData.images.length}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingProduct(null);
                      setImageFiles([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {uploading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
