import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    admin: 'Admin Dashboard',
    
    // Product Page
    allProducts: 'All Products',
    noProducts: 'No products available yet.',
    addToCart: 'Add to Cart',
    price: 'Price',
    
    // Cart
    shoppingCart: 'Shopping Cart',
    cartEmpty: 'Your cart is empty.',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
    total: 'Total',
    remove: 'Remove',
    
    // Checkout
    checkout: 'Checkout',
    customerInformation: 'Customer Information',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    secondPhone: 'Second Phone Number',
    deliveryInformation: 'Delivery Information',
    address: 'Address',
    buildingName: 'Building Name',
    buildingNumber: 'Building Number',
    city: 'City',
    deliveryNotes: 'Delivery Notes',
    selectLocation: 'Select Delivery Location on Map',
    placeOrder: 'Place Order',
    orderTotal: 'Order Total',
    
    // Order Success
    orderPlaced: 'Order Placed Successfully!',
    orderNumber: 'Order Number',
    contactSoon: 'Someone will be contacting you shortly to confirm your order.',
    viewOrderDetails: 'View Order Details',
    
    // Track Order
    trackOrder: 'Track Order',
    orderStatus: 'Order Status',
    orderDetails: 'Order Details',
    deliveryAddress: 'Delivery Address',
    orderNotFound: 'Order Not Found',
    
    // Admin
    dashboard: 'Dashboard',
    orderManagement: 'Order Management',
    productManagement: 'Product Management',
    orders: 'Orders',
    customer: 'Customer',
    status: 'Status',
    actions: 'Actions',
    viewDetails: 'View Details',
    updateStatus: 'Update Status',
    
    // Auth
    welcomeBack: 'Welcome Back',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    password: 'Password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    continueAsGuest: 'Continue as guest',
    orContinueWith: 'Or continue with',
    rememberMe: 'Remember Me',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Status
    pending: 'Pending',
    collecting: 'Collecting',
    readyToShip: 'Ready to Ship',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    cart: 'السلة',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    profile: 'الملف الشخصي',
    admin: 'لوحة التحكم',
    
    // Product Page
    allProducts: 'جميع المنتجات',
    noProducts: 'لا توجد منتجات متاحة حالياً.',
    addToCart: 'أضف إلى السلة',
    price: 'السعر',
    
    // Cart
    shoppingCart: 'سلة التسوق',
    cartEmpty: 'سلة التسوق فارغة.',
    continueShopping: 'متابعة التسوق',
    proceedToCheckout: 'إتمام الطلب',
    total: 'المجموع',
    remove: 'إزالة',
    
    // Checkout
    checkout: 'إتمام الطلب',
    customerInformation: 'معلومات العميل',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    secondPhone: 'رقم هاتف ثاني',
    deliveryInformation: 'معلومات التوصيل',
    address: 'العنوان',
    buildingName: 'اسم المبنى',
    buildingNumber: 'رقم المبنى',
    city: 'المدينة',
    deliveryNotes: 'ملاحظات التوصيل',
    selectLocation: 'حدد موقع التوصيل على الخريطة',
    placeOrder: 'تأكيد الطلب',
    orderTotal: 'إجمالي الطلب',
    
    // Order Success
    orderPlaced: 'تم تقديم الطلب بنجاح!',
    orderNumber: 'رقم الطلب',
    contactSoon: 'سيتم التواصل معك قريباً لتأكيد طلبك.',
    viewOrderDetails: 'عرض تفاصيل الطلب',
    
    // Track Order
    trackOrder: 'تتبع الطلب',
    orderStatus: 'حالة الطلب',
    orderDetails: 'تفاصيل الطلب',
    deliveryAddress: 'عنوان التوصيل',
    orderNotFound: 'الطلب غير موجود',
    
    // Admin
    dashboard: 'لوحة التحكم',
    orderManagement: 'إدارة الطلبات',
    productManagement: 'إدارة المنتجات',
    orders: 'الطلبات',
    customer: 'العميل',
    status: 'الحالة',
    actions: 'الإجراءات',
    viewDetails: 'عرض التفاصيل',
    updateStatus: 'تحديث الحالة',
    
    // Auth
    welcomeBack: 'مرحباً بعودتك',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    password: 'كلمة المرور',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    continueAsGuest: 'متابعة كزائر',
    orContinueWith: 'أو تابع باستخدام',
    rememberMe: 'تذكرني',
    
    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    close: 'إغلاق',
    confirm: 'تأكيد',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    
    // Status
    pending: 'قيد الانتظار',
    collecting: 'جاري التجميع',
    readyToShip: 'جاهز للشحن',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguage(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
