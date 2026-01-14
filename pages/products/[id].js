import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProductDetail() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to products page since we don't have individual product pages
    router.push('/products');
  }, [router]);
  
  return null;
}
