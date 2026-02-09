import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import  CountdownContextProvider from './context/Provider/CountDownContextProvider.jsx';
import { ShopProvider } from './context/ShopContext/ShopContext.jsx';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainRoute from './Components/MainRoute/MainRoute.jsx';
import Shop from './Components/Shop/Shop.jsx';
import NotFound from './Components/NotFound/NotFound.jsx';
import SignUp from './Components/SignUp/SignUp.jsx';
import Login from './Components/Login/Login.jsx';
import WishList from './Components/WishList/WishList.jsx';
import Cart from './Components/Cart/Cart.jsx';
import Checkout from './Components/Checkout/Checkout.jsx';
import MyAccount from './Components/MyAccount/MyAccount.jsx';
import Contact from './Components/Contact/Contact.jsx';
import About from './Components/About/About.jsx';
import ProductDetails from './Components/ProductDetails/ProductDetails.jsx';
import CategoryProduct from './Components/CategoryProduct/CategoryProduct.jsx';
import AuthProvider from './context/AuthContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import OrderSuccess from './Components/OrderSuccess/OrderSuccess.jsx';
import TrackOrder from './Components/TrackOrder/TrackOrder.jsx';
const router = createBrowserRouter([
  {
    path: '/',
    Component: MainRoute,
    children: [
      { index: true, Component: App },
      { path: 'shop', Component: Shop },
      { path: 'signup', Component: SignUp },
      { path: 'login', Component: Login },
      { path: 'wishlist', Component: WishList },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      {
        path: 'myAccount',
        element: (
          <PrivateRoute>
            <MyAccount />
          </PrivateRoute>
        ),
      },
      { path: 'myAccount', Component: MyAccount },
      { path: 'contact', Component: Contact },
      { path: 'about', Component: About },
      { path: 'product/:id', Component: ProductDetails },
      { path: 'products/category/:slug', Component: CategoryProduct },
      { path: '*', Component: NotFound },
      { path: '/order-success', Component: OrderSuccess },
      { path: '/track-order', Component: TrackOrder },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <CountdownContextProvider>
    <ShopProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ShopProvider>
  </CountdownContextProvider>,
);
