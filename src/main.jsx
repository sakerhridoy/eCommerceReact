import './i18n';
import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { HelmetProvider } from 'react-helmet-async';
import { ShopProvider } from './contexts/ShopContext.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CountDownContextProvider from './contexts/CountDownContext/CountDownContextProvider';
import AuthProvider from './contexts/AuthContext.jsx';
import MainRoute from './Components/MainRoute/MainRoute.jsx';
import PageLoader from './Components/PageLoader.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import PermissionRoute from './routes/PermissionRoute.jsx';
import { PERMISSIONS } from './utils/permissions.js';

// Route-level code splitting: every page is fetched on demand.
const App = lazy(() => import('./App.jsx'));
const Shop = lazy(() => import('./Components/Shop/Shop.jsx'));
const NotFound = lazy(() => import('./Components/NotFound/NotFound.jsx'));
const SignUp = lazy(() => import('./Components/SignUp/SignUp.jsx'));
const Login = lazy(() => import('./Components/Login/Login.jsx'));
const WishList = lazy(() => import('./Components/WishList/WishList.jsx'));
const Cart = lazy(() => import('./Components/Cart/Cart.jsx'));
const Checkout = lazy(() => import('./Components/Checkout/Checkout.jsx'));
const MyAccount = lazy(() => import('./Components/MyAccount/MyAccount.jsx'));
const VerifyEmail = lazy(() => import('./Components/VerifyEmail.jsx'));
const Contact = lazy(() => import('./Components/Contact/Contact.jsx'));
const About = lazy(() => import('./Components/About/About.jsx'));
const ProductDetails = lazy(
  () => import('./Components/ProductDetails/ProductDetails.jsx'),
);
const CategoryProduct = lazy(
  () => import('./Components/CategoryProduct/CategoryProduct.jsx'),
);
const OrderSuccess = lazy(
  () => import('./Components/OrderSuccess/OrderSuccess.jsx'),
);
const TrackOrder = lazy(() => import('./Components/TrackOrder/TrackOrder.jsx'));
const ResetPassword = lazy(
  () => import('./Components/ResetPassword/ResetPassword.jsx'),
);
const AddProduct = lazy(() => import('./Components/Admin/AddProduct.jsx'));
const AdminProductList = lazy(
  () => import('./Components/Admin/AdminProductList.jsx'),
);
const EditProduct = lazy(() => import('./Components/Admin/EditProduct.jsx'));
const AdminDashboard = lazy(
  () => import('./Components/Admin/AdminDashboard.jsx'),
);
const DashboardOverview = lazy(
  () => import('./Components/Admin/DashboardOverview.jsx'),
);
const AdminOrders = lazy(() => import('./Components/Admin/AdminOrders.jsx'));
const AdminCustomers = lazy(() => import('./Components/Admin/Customers.jsx'));
const AdminReviews = lazy(() => import('./Components/Admin/AdminReviews.jsx'));
const SalesReport = lazy(() => import('./Components/Admin/SalesReport.jsx'));
const ManageCoupons = lazy(
  () => import('./Components/Admin/ManageCoupons.jsx'),
);
const AdminProfile = lazy(() => import('./Components/Admin/AdminProfile.jsx'));
const AdminUsers = lazy(() => import('./Components/Admin/AdminUsers.jsx'));
const ManageSiteSettings = lazy(
  () => import('./Components/Admin/ManageSiteSettings.jsx'),
);
const MyOrders = lazy(() => import('./Components/MyOrders/MyOrders.jsx'));
const MyReviews = lazy(() => import('./Components/MyReviews/MyReviews.jsx'));
const LegalPage = lazy(() => import('./Components/LegalPage/LegalPage.jsx'));
const FAQ = lazy(() => import('./Components/FAQ/FAQ.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    Component: MainRoute, // This contains public Navbar & Footer
    children: [
      { index: true, Component: App },
      { path: 'shop', Component: Shop },
      { path: 'signup', Component: SignUp },
      { path: 'login', Component: Login },
      { path: 'reset-password', Component: ResetPassword },
      { path: 'verifyemail/:token', Component: VerifyEmail },
      { path: 'wishlist', Component: WishList },
      { path: 'cart', Component: Cart },
      {
        path: 'checkout',
        element: (
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        ),
      },
      {
        path: 'myAccount',
        element: (
          <PrivateRoute>
            <MyAccount />
          </PrivateRoute>
        ),
      },
      { path: 'contact', Component: Contact },
      { path: 'about', Component: About },
      {
        path: 'privacy-policy',
        element: (
          <LegalPage pageKey="privacyPolicy" breadcrumb="Privacy Policy" />
        ),
      },
      {
        path: 'terms-of-use',
        element: <LegalPage pageKey="termsOfUse" breadcrumb="Terms Of Use" />,
      },
      { path: 'faq', element: <FAQ /> },
      { path: 'product/:id', Component: ProductDetails },
      { path: 'products/category/:slug', Component: CategoryProduct },
      { path: 'order-success', Component: OrderSuccess },
      { path: 'track-order', Component: TrackOrder },
      { path: 'my-orders', element: <MyOrders /> },
      { path: 'my-reviews', element: <MyReviews /> },
      { path: '*', Component: NotFound }, // Catch-all inside public routes
    ],
  },
  {
    // ✅ Independent Admin Route (Completely isolated from public Navbar & Footer)
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <DashboardOverview /> },
      {
        path: 'products',
        element: (
          <PermissionRoute permission={PERMISSIONS.PRODUCT_VIEW}>
            <AdminProductList />
          </PermissionRoute>
        ),
      },
      {
        path: 'add-product',
        element: (
          <PermissionRoute permission={PERMISSIONS.PRODUCT_CREATE}>
            <AddProduct />
          </PermissionRoute>
        ),
      },
      {
        path: 'edit-product/:id',
        element: (
          <PermissionRoute permission={PERMISSIONS.PRODUCT_UPDATE}>
            <EditProduct />
          </PermissionRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <PermissionRoute permission={PERMISSIONS.ORDER_VIEW}>
            <AdminOrders />
          </PermissionRoute>
        ),
      },
      {
        path: 'customers',
        element: (
          <PermissionRoute permission={PERMISSIONS.CUSTOMER_VIEW}>
            <AdminCustomers />
          </PermissionRoute>
        ),
      },
      {
        path: 'reviews',
        element: (
          <PermissionRoute permission={PERMISSIONS.REVIEW_VIEW}>
            <AdminReviews />
          </PermissionRoute>
        ),
      },
      {
        path: 'sales-report',
        element: (
          <PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
            <SalesReport />
          </PermissionRoute>
        ),
      },
      {
        path: 'site-settings',
        element: (
          <PermissionRoute permission={PERMISSIONS.SETTINGS_MANAGE}>
            <ManageSiteSettings />
          </PermissionRoute>
        ),
      },
      {
        path: 'coupons',
        element: (
          <PermissionRoute permission={PERMISSIONS.COUPON_VIEW}>
            <ManageCoupons />
          </PermissionRoute>
        ),
      },
      {
        path: 'admin-users',
        element: (
          <PermissionRoute permission={PERMISSIONS.USER_MANAGE}>
            <AdminUsers />
          </PermissionRoute>
        ),
      },
      { path: 'profile', element: <AdminProfile /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <CountDownContextProvider>
        <AuthProvider>
          <ShopProvider>
            <Suspense fallback={<PageLoader />}>
              <RouterProvider router={router} />
            </Suspense>
          </ShopProvider>
        </AuthProvider>
      </CountDownContextProvider>
    </GoogleOAuthProvider>
  </HelmetProvider>,
);
