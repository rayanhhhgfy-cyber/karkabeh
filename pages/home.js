import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(6);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Karkabeh</h1>
      <p className="text-xl mb-8">Premium Men's Fashion</p>
      
      {loading ? (
        <p>Loading products...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-md">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-lg font-bold mt-2">${product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No products available yet.</p>
      )}
    </div>
  );
}
