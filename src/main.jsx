import './i18n';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { ShopProvider } from './contexts/ShopContext.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CountDownContextProvider from './contexts/CountDownContext/CountDownContextProvider';
import MainRoute from './Components/MainRoute/MainRoute.jsx';
import Shop from './Components/Shop/Shop.jsx';
import NotFound from './Components/NotFound/NotFound.jsx';
import SignUp from './Components/SignUp/SignUp.jsx';
import Login from './Components/Login/Login.jsx';
import WishList from './Components/WishList/WishList.jsx';
import Cart from './Components/Cart/Cart.jsx';
import Checkout from './Components/Checkout/Checkout.jsx';
import MyAccount from './Components/MyAccount/MyAccount.jsx';
import VerifyEmail from './Components/VerifyEmail.jsx';
import Contact from './Components/Contact/Contact.jsx';
import About from './Components/About/About.jsx';
import ProductDetails from './Components/ProductDetails/ProductDetails.jsx';
import CategoryProduct from './Components/CategoryProduct/CategoryProduct.jsx';
import AuthProvider from './contexts/AuthContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import OrderSuccess from './Components/OrderSuccess/OrderSuccess.jsx';
import TrackOrder from './Components/TrackOrder/TrackOrder.jsx';
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import AddProduct from './Components/Admin/AddProduct.jsx';
import AdminProductList from './Components/Admin/AdminProductList.jsx';
import EditProduct from './Components/Admin/EditProduct.jsx';
import AdminDashboard from './Components/Admin/AdminDashboard.jsx';
import DashboardOverview from './Components/Admin/DashboardOverview.jsx';
import AdminOrders from './Components/Admin/AdminOrders.jsx';
import AdminCustomers from './Components/Admin/Customers.jsx';
import MyOrders from './Components/MyOrders/MyOrders.jsx';
import MyReviews from './Components/MyReviews/MyReviews.jsx';
import AdminReviews from './Components/Admin/AdminReviews.jsx';
import SalesReport from './Components/Admin/SalesReport.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import ManageAbout from './Components/Admin/ManageAbout.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    Component: MainRoute,
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
      { path: 'product/:id', Component: ProductDetails },
      { path: 'products/category/:slug', Component: CategoryProduct },
      { path: '*', Component: NotFound },
      { path: 'order-success', Component: OrderSuccess },
      { path: 'track-order', Component: TrackOrder },
      { path: 'my-orders', element: <MyOrders /> },
      { path: 'my-reviews', element: <MyReviews /> },
      {
        path: '/admin',
        element: <AdminRoute><AdminDashboard /></AdminRoute>,
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'products', element: <AdminProductList /> }, // /admin/products
          { path: 'add-product', element: <AddProduct /> }, // /admin/add-product
          { path: 'edit-product/:id', element: <EditProduct /> }, // /admin/edit-product/123
          { path: 'orders', element: <AdminOrders /> },
          { path: 'customers', element: <AdminCustomers /> },
          { path: 'reviews', element: <AdminReviews /> },
          { path: 'sales-report', element: <SalesReport /> },
          { path: 'manage-about', element: <ManageAbout /> }
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <CountDownContextProvider>
      <AuthProvider>
        <ShopProvider>
          <RouterProvider router={router} />
        </ShopProvider>
      </AuthProvider>
    </CountDownContextProvider>
  </GoogleOAuthProvider>,
);
