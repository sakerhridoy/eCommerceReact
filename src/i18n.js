import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      home: "Home",
      shop: "Shop",
      contact: "Contact",
      about: "About",
      myAccount: "My Account",
      myOrders: "My Orders",
      checkout: "CheckOut",
      cart: "Cart",
      wishlist: "Wishlist",
      searchPlaceholder: "What are you looking for?",
      placeOrder: "Place Order",
    }
  },
  bn: {
    translation: {
      home: "হোম",
      shop: "শপ",
      contact: "যোগাযোগ",
      about: "আমাদের সম্পর্কে",
      myAccount: "আমার অ্যাকাউন্ট",
      myOrders: "আমার অর্ডারসমূহ",
      checkout: "চেকআউট",
      cart: "কার্ট",
      wishlist: "উইশলিস্ট",
      searchPlaceholder: "আপনি কি খুঁজছেন?",
      placeOrder: "অর্ডার কনফার্ম করুন",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", 
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;