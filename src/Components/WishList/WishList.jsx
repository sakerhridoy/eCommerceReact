import React from 'react';
import { IoEyeOutline } from 'react-icons/io5';
import { FaStar, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router';
import { useShop } from '../../Context/ShopContext/ShopContext';

const WishList = () => {
  const { wishlist, addToCart, removeFromWishlist } = useShop();

  const getItemImage = item =>
    item.img || item.thumbnail || item.image || '';

  const getItemName = item => item.name || item.title || 'Product';

  const getItemPrice = item => item.dPrice ?? item.price ?? 0;

  if (!wishlist.length) {
    return (
      <section className="pt-[95px] pb-[140px]">
        <div className="container text-center">
          <p className="text-black/50">Your wishlist is empty.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-[95px] pb-[140px]">
      <div className="container">
        <div className="grid grid-cols-4 gap-8">
          {wishlist.map(item => (
            <div key={item.id} className="group relative">
              {/* Image Box */}
              <div className="bg-[#F5F5F5] py-[35px] rounded-sm relative overflow-hidden">
                <img
                  src={getItemImage(item)}
                  alt={getItemName(item)}
                  className="mx-auto w-[172px] transition-transform duration-300 group-hover:scale-90"
                />

                {/* Discount (if present) */}
                {item.dis > 0 && (
                  <span className="absolute top-3 left-3 bg-[#DB4444] px-3 py-1 rounded-sm text-xs text-white">
                    -{item.dis}%
                  </span>
                )}

                {/* Heart Icon (remove from wishlist) */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="bg-white p-1.5 rounded-full hover:bg-black/10 duration-200"
                    aria-label="Remove from wishlist"
                  >
                    <FaHeart className="text-red-500" />
                  </button>
                  <Link
                    to={`/product/${item.id}`}
                    className="bg-white p-1.5 rounded-full hover:bg-black/10 duration-200 flex items-center justify-center"
                    aria-label="View details"
                  >
                    <IoEyeOutline />
                  </Link>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCart(item)}
                  className="absolute left-0 w-full bg-black text-white text-sm py-2
                   bottom-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  Add To Cart
                </button>
              </div>

              {/* Details */}
              <div className="pt-4">
                <h3 className="text-base font-medium">{getItemName(item)}</h3>
                <p className="py-2 font-medium">
                  <span className="text-[#DB4444]">${getItemPrice(item)}</span>
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-[#FFAD33]" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WishList;