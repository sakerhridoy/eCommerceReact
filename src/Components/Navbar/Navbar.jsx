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
import { getProducts, getImageUrl } from '../../api/catalog';
import { useTranslation } from 'react-i18next';
import {
  isAdminRole,
  normalizeRole,
  ROLE_LABELS,
  ROLES,
} from '../../utils/permissions';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useShopStore(state => state.cartCount);
  const wishlistCount = useShopStore(state => state.wishlistCount);
  const { user, logout } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  // Staff-only role badge + role-aware "Profile" / "Dashboard" labels.
  // The canonical `super_admin` role is surfaced to users as plain "Admin".
  const normalizedRole = normalizeRole(user?.role);
  const roleLabel =
    normalizedRole === ROLES.SUPER_ADMIN
      ? 'Admin'
      : ROLE_LABELS[normalizedRole] || 'Admin';

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
                    className="w-8 h-8 rounded-full bg-[#DB4444] text-white flex items-center justify-center cursor-pointer overflow-hidden ring-2 ring-transparent hover:ring-[#DB4444]/30 transition"
                  >
                    {user?.avatar?.url ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <LuUser />
                    )}
                  </div>
                  <div
                    className={`absolute right-0 top-12 w-64 origin-top-right bg-gradient-to-br from-[#8A7A99]/60 to-[#5F5070]/80 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/10 z-50 overflow-hidden transition-all duration-200 ${showAcc ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-1 pointer-events-none'}`}
                  >
                    <ul className="font-poppins text-[14px] text-[#FAFAFA]">
                      {user ? (
                        <>
                          {/* Header: avatar + name + email (সব ইউজারের জন্য) */}
                          <li className="flex items-center gap-3 px-5 py-4 border-b border-white/15 bg-gradient-to-r from-white/15 to-transparent">
                            <div className="w-10 h-10 rounded-full bg-[#DB4444] text-white overflow-hidden flex items-center justify-center flex-shrink-0">
                              {user?.avatar?.url ? (
                                <img
                                  src={getImageUrl(user.avatar)}
                                  alt={user?.name || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <LuUser />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">
                                {user?.name || 'User'}
                              </p>
                              {isAdmin && (
                                <span className="mt-0.5 inline-block rounded-full bg-white/20 px-2 py-px text-[10px] font-semibold tracking-wide text-white uppercase">
                                  {roleLabel}
                                </span>
                              )}
                              <p className="text-xs text-white/70 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </li>
                          <li className="p-1.5">
                            <Link
                              to={isAdmin ? '/admin/profile' : '/myAccount'}
                              onClick={() => setShowAcc(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <LuUser className="text-lg" />
                              {isAdmin
                                ? `${roleLabel} Profile`
                                : t('Manage My Account')}
                            </Link>
                          </li>
                          {isAdmin && (
                            <li className="px-1.5">
                              <Link
                                to="/admin"
                                onClick={() => setShowAcc(false)}
                                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <LuUser className="text-lg" />{' '}
                                {`${roleLabel} Dashboard`}
                              </Link>
                            </li>
                          )}
                          <li className="px-1.5">
                            <Link
                              to={isAdmin ? '/admin/orders' : '/my-orders'}
                              onClick={() => setShowAcc(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <LuShoppingBag className="text-lg" />{' '}
                              {t('My Orders')}
                            </Link>
                          </li>
                          {/* === Dynamic Reviews Link (Desktop) === */}
                          <li className="px-1.5">
                            <Link
                              to={isAdmin ? '/admin/reviews' : '/my-reviews'}
                              onClick={() => setShowAcc(false)}
                              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <LuStar className="text-lg" />{' '}
                              {isAdmin ? t('All Reviews') : t('My Reviews')}
                            </Link>
                          </li>
                          <li className="px-1.5 pb-1.5">
                            <div className="border-t border-white/15 pt-1.5">
                              <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-200 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <TbLogout2 className="text-lg" /> {t('logout')}
                              </button>
                            </div>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="p-1.5">
                            <Link
                              to="/login"
                              onClick={() => setShowAcc(false)}
                              className="flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-[#DB4444] text-white font-medium transition-colors hover:bg-[#b80808]"
                            >
                              {t('login')}
                            </Link>
                          </li>
                          <li className="p-1.5 pt-0">
                            <Link
                              to="/signup"
                              onClick={() => setShowAcc(false)}
                              className="flex items-center justify-center px-3.5 py-2.5 rounded-xl border border-white/40 font-medium transition-colors hover:bg-white/10 hover:border-white"
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
                  <li className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#DB4444] text-white overflow-hidden flex items-center justify-center flex-shrink-0">
                      {user?.avatar?.url ? (
                        <img
                          src={getImageUrl(user.avatar)}
                          alt={user?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <LuUser />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-black truncate">
                        {user?.name || 'User'}
                      </p>
                      {isAdmin && (
                        <span className="mt-0.5 inline-block rounded-full bg-[#DB4444]/10 px-2 py-px text-[10px] font-semibold tracking-wide text-[#DB4444] uppercase">
                          {roleLabel}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </li>
                  <li>
                    <Link
                      to={isAdmin ? '/admin/profile' : '/myAccount'}
                      onClick={closeMenu}
                    >
                      {isAdmin ? `${roleLabel} Profile` : t('myAccount')}
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link to="/admin" onClick={closeMenu}>
                        {`${roleLabel} Dashboard`}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to={isAdmin ? '/admin/orders' : '/my-orders'}
                      onClick={closeMenu}
                    >
                      {t('myOrders')}
                    </Link>
                  </li>
                  {/* === Dynamic Reviews Link (Mobile) === */}
                  <li>
                    <Link
                      to={isAdmin ? '/admin/reviews' : '/my-reviews'}
                      onClick={closeMenu}
                    >
                      {isAdmin ? t('allReviews') : t('myReviews')}
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