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
import { useShop } from '../../context/shopContext/ShopContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, wishlist } = useShop();
  const { user, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAcc, setShowAcc] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [language, setLanguage] = useState('English'); // selected language

  const dropdownRef = useRef(null);
  const hideIcons =
    location.pathname === '/login' || location.pathname === '/signup';

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );
  const wishlistCount = wishlist.length;

  // Close dropdown when clicking outside
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

  // Mobile menu scroll lock
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
  }, [isMenuOpen]);

  // Live search dropdown
  useEffect(() => {
    if (!search.trim()) return setResults([]);

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://dummyjson.com/products/search?q=${search}`,
        );
        setResults(res.data.products.slice(0, 5));
      } catch {
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
    await logout();
    setShowAcc(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="border-b border-gray-200/70 bg-white sticky top-0 z-50">
      <div className="bg-black py-2.5 text-white text-[10px] sm:text-sm px-4 lg:px-0">
        <div className="container flex justify-end-safe gap-20 lg:gap-67.5 items-center">
          <p className="">
            <span className="hidden md:inline-block">
              Summer Sale For All Swim Suits And
            </span>{' '}
            Free ExpressDelivery - OFF 50%!
            <Link to="/shop" className="underline ps-2 sm:ps-4">
              ShopNow
            </Link>
          </p>

          {/* Desktop Language Selector */}
          <div className="hidden sm:block">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-white bg-black outline-none px-2 py-1 rounded"
            >
              <option value="English" className="bg-black text-white">
                English
              </option>
              <option value="Bangla" className="bg-black text-white">
                Bangla
              </option>
            </select>
          </div>

          {/* Mobile Language Icon */}
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
                  {['English', 'Bangla'].map(lang => (
                    <li
                      key={lang}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        setLanguage(lang);
                        setMobileLangOpen(false);
                      }}
                    >
                      {lang}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 lg:py-5">
          {/* Logo */}
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Logo" className="h-9 xl:h-10 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-9 text-[12px] xl:text-base font-medium text-gray-800">
            <li>
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" onClick={closeMenu}>
                Shop
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMenu}>
                About
              </Link>
            </li>
            {!user && (
              <li>
                <Link to="/signup" onClick={closeMenu}>
                  Sign Up
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
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent outline-none text-sm"
                />
                <button type="submit">
                  <FiSearch className="text-black" />
                </button>
              </div>
              {search && (
                <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 rounded mt-1">
                  {loading ? (
                    <p className="p-3 text-sm">Searching...</p>
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
                          src={item.thumbnail}
                          className="w-10 h-10 object-contain"
                          alt={item.title}
                        />
                        <p className="text-sm">{item.title}</p>
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-gray-500">No result found</p>
                  )}
                </div>
              )}
            </form>

            {!hideIcons && (
              <div className="flex items-center gap-5 lg:gap-7 text-xl text-gray-800">
                {/* Wishlist */}
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
                {/* Cart */}
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
                {/* User Dropdown */}
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
                              <LuUser /> Manage My Account
                            </Link>
                          </li>
                          <li className="flex items-center gap-3 cursor-pointer">
                            <LuShoppingBag /> My Orders
                          </li>
                          <li className="flex items-center gap-3 cursor-pointer">
                            <LuStar /> My Reviews
                          </li>
                          <li
                            onClick={handleLogout}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <TbLogout2 /> Logout
                          </li>
                        </>
                      ) : (
                        <>
                          <li>
                            <Link to="/login" onClick={() => setShowAcc(false)}>
                              Login
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/signup"
                              onClick={() => setShowAcc(false)}
                            >
                              Sign Up
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
                {/* Mobile Hamburger */}
                <button
                  className="lg:hidden text-2xl p-1 -mr-1"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <RxHamburgerMenu />
                </button>
              </div>
            )}

            {hideIcons && (
              <button
                className="lg:hidden text-2xl text-gray-800 p-1"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <RxHamburgerMenu />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
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

            {/* Mobile Menu Links */}
            <ul className="flex flex-col px-4 py-6 gap-6">
              <li>
                <Link to="/" onClick={closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" onClick={closeMenu}>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/contact" onClick={closeMenu}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={closeMenu}>
                  About
                </Link>
              </li>
              {!user && (
                <li>
                  <Link to="/signup" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </li>
              )}
              {user && (
                <>
                  <li>
                    <Link to="/myAccount" onClick={closeMenu}>
                      My Account
                    </Link>
                  </li>
                  <li>My Orders</li>
                  <li>My Reviews</li>
                  <li onClick={handleLogout} className="cursor-pointer">
                    Logout
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
