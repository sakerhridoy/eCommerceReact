import React, { useEffect, useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { LuShoppingBag, LuStar } from 'react-icons/lu';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { FiSearch } from 'react-icons/fi';
import { FaRegHeart } from 'react-icons/fa6';
import { IoCartOutline } from 'react-icons/io5';
import { TbLogout2 } from 'react-icons/tb';
import { LuUser } from 'react-icons/lu';
import logo from '../../assets/Images/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useShop } from '../../Context/ShopContext/ShopContext';
import axios from 'axios';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAcc, setShowAcc] = useState(false);

  // Global cart & wishlist from ShopContext
  const { cart, wishlist } = useShop();

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );
  const wishlistCount = wishlist.length;

  /* ================= SEARCH ================= */
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const hideIcons =
    location.pathname === '/signup' || location.pathname === '/login';

  /* ================= LIVE SEARCH DROPDOWN ================= */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://dummyjson.com/products/search?q=${search}`,
        );
        setResults(res.data.products.slice(0, 5));
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // debounce

    return () => clearTimeout(delay);
  }, [search]);

  /* ================= HANDLE SEARCH SUBMIT ================= */
  const handleSearch = e => {
    e.preventDefault();
    if (!search.trim()) return;

    navigate(`/shop?search=${search}`);
    setSearch('');
    setResults([]);
  };

  return (
    <nav className="pb-4 border-b border-black/20">
      {/* TOP BAR */}
      <div className="bg-black py-3">
        <div className="container flex justify-end-safe gap-[265px] items-center">
          <div className="left">
            <p className="font-poppins font-normal text-sm text-[#FAFAFA] leading-[21px]">
              Summer Sale For All Swim Suits And Free Express Delivery - OFF
              50%!
              <Link
                to="/shop"
                className="underline leading-6 font-semibold ps-2"
              >
                ShopNow
              </Link>
            </p>
          </div>
          <div className="flex justify-end">
            <select className="text-white bg-black outline-none">
              <option>English</option>
              <option>Bangla</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className="container relative">
        <div className="flex justify-between items-center mt-10">
          {/* LOGO */}
          <Link to="/">
            <img src={logo} alt="logo" className="w-[118px]" />
          </Link>

          {/* MENU */}
          <ul className="flex gap-12">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/shop">Shop</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </ul>

          {/* RIGHT */}
          <div className="flex items-center gap-6 relative">
            {/* 🔍 SEARCH */}
            <form onSubmit={handleSearch} className="relative w-[243px]">
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

              {/* SEARCH DROPDOWN */}
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
                          alt=""
                          className="w-10 h-10 object-contain"
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
              <div className="flex items-center gap-4 text-xl">
                {/* WISHLIST */}
                <div className="relative">
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                  <Link to="/wishlist">
                    <FaRegHeart />
                  </Link>
                </div>

                {/* CART */}
                <div className="relative">
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                  <Link to="/cart">
                    <IoCartOutline />
                  </Link>
                </div>

                {/* USER */}
                <div
                  onClick={() => setShowAcc(!showAcc)}
                  className="w-8 h-8 rounded-full bg-[#DB4444] text-white flex items-center justify-center cursor-pointer"
                >
                  <LuUser />
                </div>

                {showAcc && (
                  <div className="absolute right-0 top-12 w-[225px] bg-[#7D6C8C]/60 backdrop-blur-md rounded-sm shadow-lg px-5 py-4 z-50">
                    <ul className="font-poppins font-normal text-[14px] leading-[21px] text-[#FAFAFA] space-y-[18px]">
                      <li>
                        <Link
                          to="/myAccount"
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <LuUser className="text-2xl" /> Manage My Account
                        </Link>
                      </li>
                      <li className="flex items-center gap-3 cursor-pointer">
                        <LuShoppingBag className="text-2xl" /> My Order
                      </li>
                      <li className="flex items-center gap-3 cursor-pointer">
                        <AiOutlineCloseCircle className="text-2xl" /> My
                        Cancellations
                      </li>
                      <li className="flex items-center gap-3 cursor-pointer">
                        <LuStar className="text-2xl" /> My Reviews
                      </li>
                      <li>
                        <Link
                          to="/signup"
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <TbLogout2 className="text-2xl" /> Logout
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;