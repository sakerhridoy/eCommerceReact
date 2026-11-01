import { useState, useEffect, useRef } from 'react';
import { MdOutlineLanguage } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { FaRegHeart } from 'react-icons/fa6';
import { IoCartOutline } from 'react-icons/io5';
import { LuUser, LuShoppingBag, LuStar } from 'react-icons/lu';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { TbLogout2 } from 'react-icons/tb';
import { RxHamburgerMenu } from 'react-icons/rx';
import logo from '../../assets/images/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useShopStore from '../../store/cartStore';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts } from '../../api/catalog';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useShopStore(state => state.cartCount);
  const wishlistCount = useShopStore(state => state.wishlistCount);
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAcc, setShowAcc] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language || 'en');

  const dropdownRef = useRef(null);
  const hideIcons =
    location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        showAcc &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowAcc(false);
      }
      if (mobileLangOpen && !event.target.closest('#mobile-lang-btn')) {
        setMobileLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAcc, mobileLangOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  useEffect(() => {
    if (!search.trim()) return setResults([]);

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setResults(await getProducts({ search, limit: 5 }));
      } catch (error) {
        console.error('Product search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/shop?search=${search}`);
    setSearch('');
    setResults([]);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowAcc(false);
      setIsMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const handleLanguageChange = selectedLang => {
    setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
  };

  return (
    <nav className="border-b border-gray-200/70 bg-white sticky top-0 z-50">
      {/* Top Black Bar */}
      <div className="bg-black py-2.5 text-white text-[10px] sm:text-sm px-4 lg:px-0">
        <div className="container flex justify-end-safe gap-20 lg:gap-67.5 items-center">
          <p className="">
            <span className="hidden md:inline-block">
              {t('Summer Sale For All Swim Suits And')}
            </span>{' '}
            {t('Free ExpressDelivery - OFF 50%!')}
            <Link to="/shop" className="underline ps-2 sm:ps-4">
              {t('ShopNow')}
            </Link>
          </p>

          {/* Desktop Language Select */}
          <div className="hidden sm:block">
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              className="text-white bg-black outline-none px-2 py-1 rounded cursor-pointer"
            >
              <option value="en" className="bg-black text-white">
                English
              </option>
              <option value="bn" className="bg-black text-white">
                Bangla
              </option>
            </select>
          </div>

          {/* Mobile Language Button */}
          <div className="sm:hidden relative">
            <button
              id="mobile-lang-btn"
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              className="text-white text-xl"
            >
              <MdOutlineLanguage />
            </button>
            {mobileLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg z-50">
                <ul>
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'bn', label: 'Bangla' },
                  ].map(lang => (
                    <li
                      key={lang.code}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setMobileLangOpen(false);
                      }}
                    >
                      {lang.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 lg:py-5">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Logo" className="h-9 xl:h-10 w-auto" />
          </Link>

          <ul className="hidden lg:flex items-center gap-9 text-[12px] xl:text-base font-medium text-gray-800">
            <li>
              <Link to="/" onClick={closeMenu}>
                {t('home')}
              </Link>
            </li>
            <li>
              <Link to="/shop" onClick={closeMenu}>
                {t('shop')}
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu}>
                {t('contact')}
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMenu}>
                {t('about')}
              </Link>
            </li>
            {!user && (
              <li>
                <Link to="/signup" onClick={closeMenu}>
                  {t('signUp')}
                </Link>
              </li>
            )}
          </ul>

          <div className="flex items-center gap-4 lg:gap-4 xl:gap-6">
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:block min-w-55 md:min-w-[320px]"
            >
              <div className="bg-[#F5F5F5] rounded-sm flex items-center py-2.5 px-4">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-transparent outline-none text-sm"
                />
                <button type="submit">
                  <FiSearch className="text-black" />
                </button>
              </div>
              {search && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 rounded mt-1">
                  {loading ? (
                    <p className="p-3 text-sm">{t('searching')}</p>
                  ) : results.length > 0 ? (
                    results.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/product/${item.id}`);
                          setSearch('');
                        }}
                        className="flex gap-3 items-center p-3 hover:bg-gray-100 cursor-pointer"
                      >
                        <img
                          src={item.img}
                          className="w-10 h-10 object-contain"
                          alt={item.title}
                        />
                        <p className="text-sm">{item.title}</p>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-gray-500">
                      {t('noResultFound')}
                    </p>
                  )}
                </div>
              )}
            </form>

            {!hideIcons && (
              <div className="flex items-center gap-5 lg:gap-7 text-xl text-gray-800">
                <div className="relative">
                  <Link
                    to="/wishlist"
                    className="text-xl hover:text-red-600 transition"
                  >
                    <FaRegHeart />
                  </Link>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-1.5 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-px rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Link
                    to="/cart"
                    className="text-xl hover:text-red-600 transition"
                  >
                    <IoCartOutline />
                  </Link>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-px rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>

                {/* USER DROPDOWN */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    onClick={() => setShowAcc(!showAcc)}
                    className="w-8 h-8 rounded-full bg-[#DB4444] text-white flex items-center justify-center cursor-pointer"
                  >
                    <LuUser />
                  </div>
                  <div
                    className={`absolute right-0 top-12 w-56.25 bg-[#7D6C8C]/60 backdrop-blur-md rounded-sm shadow-lg px-5 py-4 z-50 transition-all duration-300 ${showAcc ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
                  >
                    <ul className="font-poppins font-normal text-[14px] leading-5.25 text-[#FAFAFA] space-y-4.5">
                      {user ? (
                        <>
                          <li>
                            <Link
                              to="/myAccount"
                              onClick={() => setShowAcc(false)}
                              className="flex items-center gap-3"
                            >
                              <LuUser /> {t('Manage My Account')}
                            </Link>
                          </li>
                          {user?.role === 'admin' && (
                            <li>
                              <Link
                                to="/admin"
                                onClick={() => setShowAcc(false)}
                                className="flex items-center gap-3"
                              >
                                <LuUser /> {t('Admin Dashboard')}
                              </Link>
                            </li>
                          )}
                          <li>
                            <Link
                              to={
                                user?.role === 'admin'
                                  ? '/admin/orders'
                                  : '/my-orders'
                              }
                              onClick={() => setShowAcc(false)}
                              className="flex items-center gap-3"
                            >
                              <LuShoppingBag /> {t('My Orders')}
                            </Link>
                          </li>
                          {/* === Dynamic Reviews Link (Desktop) === */}
                          <li>
                            <Link
                              to={
                                user?.role === 'admin'
                                  ? '/admin/reviews'
                                  : '/my-reviews'
                              }
                              onClick={() => setShowAcc(false)}
                              className="flex items-center gap-3"
                            >
                              <LuStar />{' '}
                              {user?.role === 'admin'
                                ? t('All Reviews')
                                : t('My Reviews')}
                            </Link>
                          </li>
                          <li
                            onClick={handleLogout}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <TbLogout2 /> {t('logout')}
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link to="/login" onClick={() => setShowAcc(false)}>
                              {t('login')}
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/signup"
                              onClick={() => setShowAcc(false)}
                            >
                              {t('signUp')}
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <button
                  className="lg:hidden text-2xl p-1 -mr-1"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <RxHamburgerMenu />
                </button>
              </div>
            )}

            {hideIcons && (
              <button
                className="lg:hidden text-2xl text-gray-800 p-1"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <RxHamburgerMenu />
              </button>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeMenu}
        >
          <div
            className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-4 border-b">
              <img src={logo} className="h-9 w-auto" alt="Logo" />
              <AiOutlineCloseCircle
                className="text-2xl cursor-pointer"
                onClick={closeMenu}
              />
            </div>
            <ul className="flex flex-col px-4 py-6 gap-6">
              <li>
                <Link to="/" onClick={closeMenu}>
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={closeMenu}>
                  {t('shop')}
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={closeMenu}>
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={closeMenu}>
                  {t('about')}
                </Link>
              </li>

              {!user && (
                <li>
                  <Link to="/signup" onClick={closeMenu}>
                    {t('signUp')}
                  </Link>
                </li>
              )}

              {user && (
                <>
                  <li>
                    <Link to="/myAccount" onClick={closeMenu}>
                      {t('manageMyAccount')}
                    </Link>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Link to="/admin" onClick={closeMenu}>
                        {t('adminDashboard')}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to={
                        user?.role === 'admin' ? '/admin/orders' : '/my-orders'
                      }
                      onClick={closeMenu}
                    >
                      {t('myOrders')}
                    </Link>
                  </li>
                  {/* === Dynamic Reviews Link (Mobile) === */}
                  <li>
                    <Link
                      to={
                        user?.role === 'admin'
                          ? '/admin/reviews'
                          : '/my-reviews'
                      }
                      onClick={closeMenu}
                    >
                      {user?.role === 'admin'
                        ? t('allReviews')
                        : t('myReviews')}
                    </Link>
                  </li>
                  <li onClick={handleLogout} className="cursor-pointer">
                    {t('logout')}
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;