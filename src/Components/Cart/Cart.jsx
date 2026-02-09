import React, { useState } from 'react';
import { Link } from 'react-router';
import { useShop } from '../../Context/ShopContext/ShopContext';
import {
  MdOutlineKeyboardArrowUp,
  MdOutlineKeyboardArrowDown,
} from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';

const Cart = () => {
  const { cart, incrementQuantity, decrementQuantity, removeFromCart } =
    useShop();
  const shippingCost = 0;

  const getItemPrice = item => item.dPrice ?? item.price ?? 0;
  const getItemImage = item => item.img || item.thumbnail || item.image || '';
  const getItemName = item => item.name || item.title || 'Product';

  const subtotal = cart.reduce(
    (acc, item) => acc + getItemPrice(item) * (item.quantity || 1),
    0,
  );
  const total = subtotal + shippingCost;

  return (
    <section className="pb-[140px] pt-10">
      <div className="container px-4 xl:px-0">
        {/* Breadcrumb */}
        <div className="py-10">
          <p className="font-poppins font-normal text-sm text-black/50">
            <Link to="/">Home</Link> / <span className="text-black">Cart</span>
          </p>
        </div>

        {/* Cart Table Header */}
        <div className="hidden md:flex justify-between items-center shadow-sm py-4 px-10 select-none mb-10 rounded-sm">
          <div className="w-1/4">
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Product
            </h3>
          </div>
          <div className="flex justify-between w-[70%]">
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Price
            </h3>
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Quantity
            </h3>
            <h3 className="text-base font-poppins font-normal leading-6 text-black">
              Subtotal
            </h3>
          </div>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <p className="text-center py-10 text-black/50">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm py-4 px-6 md:px-10 select-none rounded-sm"
              >
                {/* Product Info */}
                <div className="flex w-full md:w-1/4 items-center gap-4 relative group">
                  <img
                    src={getItemImage(item)}
                    alt={getItemName(item)}
                    className="w-16 transition-transform duration-300 group-hover:translate-x-2"
                  />

                  <IoMdCloseCircle
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#db4444] absolute top-0.5 -left-1.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  <span className="text-sm font-poppins font-normal leading-6 text-black">
                    {getItemName(item)}
                  </span>
                </div>

                {/* Price / Quantity / Subtotal */}
                <div className="flex flex-col md:flex-row justify-between w-full md:w-[70%] mt-4 md:mt-0 items-start md:items-center gap-4 md:gap-6">
                  <div className="text-base font-poppins font-normal leading-6 text-black">
                    ${getItemPrice(item)}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border rounded-sm py-1.5 px-3 gap-2 border-black/40">
                    <span className="ml-2">{item.quantity}</span>
                    <div className="flex flex-col items-center cursor-pointer">
                      <MdOutlineKeyboardArrowUp
                        onClick={() => incrementQuantity(item.id)}
                      />
                      <MdOutlineKeyboardArrowDown
                        onClick={() => decrementQuantity(item.id)}
                      />
                    </div>
                  </div>

                  <div className="text-base font-poppins font-normal leading-6 text-black text-end">
                    ${getItemPrice(item) * (item.quantity || 1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Actions & Coupon / Total */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mt-12">
          <div className="flex flex-col gap-6 w-full lg:w-1/2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-4">
              <button className="px-12 py-4 bg-transparent border border-black/50 text-black font-poppins font-medium text-base leading-6 rounded-sm w-full sm:w-auto">
                Return To Shop
              </button>
              <button className="px-12 py-4 bg-transparent border border-black/50 text-black font-poppins font-medium text-base leading-6 rounded-sm w-full sm:w-auto">
                Update Cart
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="text"
                placeholder="Coupon code"
                className="w-full sm:w-[60%] rounded-sm border border-black py-4 px-6 focus:outline-none"
              />
              <button className="px-12 py-4 bg-[#DB4444] text-[#fafafa] font-poppins font-medium text-base leading-6 rounded-sm w-full sm:w-auto">
                Apply Coupon
              </button>
            </div>
          </div>

          <div className="w-full lg:w-[35%]">
            {cart.length > 0 && (
              <div className="border py-8 px-6 border-black rounded-sm">
                <h3 className="font-poppins font-medium text-xl text-black leading-7 pb-6">
                  Cart Total
                </h3>
                <div className="flex justify-between mb-4 pb-4 border-b border-black/40">
                  <span className="font-poppins font-normal text-base text-black leading-6">
                    Subtotal:
                  </span>
                  <span className="font-poppins font-normal text-base text-black leading-6">
                    ${subtotal}
                  </span>
                </div>
                <div className="flex justify-between mb-4 pb-4 border-b border-black/40">
                  <span className="font-poppins font-normal text-base text-black leading-6">
                    Shipping:
                  </span>
                  <span className="font-poppins font-normal text-base text-black leading-6">
                    ${shippingCost}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span className="font-poppins font-normal text-base text-black leading-6">
                    Total
                  </span>
                  <span className="font-poppins font-normal text-base text-black leading-6">
                    ${total}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  className="px-12 py-4 bg-[#DB4444] text-[#fafafa] font-poppins font-medium text-base leading-6 rounded-sm mx-auto block text-center"
                >
                  Procees to checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;