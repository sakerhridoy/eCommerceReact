import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import footerLogo from '../../assets/images/footerLogo.png';
import qrCode from '../../assets/images/qrCode.png';
import appStore from '../../assets/images/appStore.png';
import playStore from '../../assets/images/playStore.png';
import { RiFacebookLine, RiTwitterLine, RiLinkedinLine } from 'react-icons/ri';
import { IoLogoInstagram } from 'react-icons/io';
import { GoPaperAirplane } from 'react-icons/go';
import Swal from 'sweetalert2';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = e => {
    e.preventDefault();
    if (email.trim()) {
      Swal.fire({
        icon: 'success',
        title: 'Subscribed!',
        text: 'Thank you for subscribing to our newsletter.',
        confirmButtonColor: '#DB4444',
      });
      setEmail('');
    }
  };

  return (
    <>
      <footer className="bg-black">
        <div className="mx-4 xl:mx-0">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:gap-10 lg:gap-4 pt-20 pb-15">
              <div className="w-full sm:w-[65%] xl:w-[90%] pb-4">
                <Link to="/">
                  <img
                    src={footerLogo}
                    alt="Exclusive Logo"
                    className="w-29.5 cursor-pointer"
                  />
                </Link>
                <div className="py-6">
                  <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] py-6">
                    Subscribe
                  </h5>
                  <p className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Get 10% off your first order
                  </p>
                  <form onSubmit={handleSubscribe} className="pt-4 relative">
                    <div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="py-3 ps-4 pr-12 w-full bg-transparent border border-[#fafafa] rounded-sm text-[#fafafa] focus:outline-none focus:border-[#DB4444] transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 hover:text-[#DB4444] transition-colors"
                    >
                      <GoPaperAirplane className="text-2xl text-[#fafafa] hover:text-[#DB4444] transition-colors" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="w-full sm:w-[45%] lg:w-[60%] xl:w-[90%] pb-4">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Support
                </h5>
                <div className="flex flex-col gap-4">
                  <p className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors cursor-default">
                    111 Bijoy sarani, Dhaka, DH 1515, Bangladesh.
                  </p>
                  <a
                    href="mailto:exclusive@gmail.com"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-[#DB4444] transition-colors"
                  >
                    exclusive@gmail.com
                  </a>
                  <a
                    href="tel:+88015888889999"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-[#DB4444] transition-colors"
                  >
                    +88015-88888-9999
                  </a>
                </div>
              </div>

              <div className="w-full sm:w-1/2 xl:w-[90%] pb-4">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Account
                </h5>
                <div className="flex flex-col gap-4">
                  <Link
                    to="/myAccount"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/login"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    Login / Register
                  </Link>
                  <Link
                    to="/cart"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    Cart
                  </Link>
                  <Link
                    to="/wishlist"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    Wishlist
                  </Link>
                </div>
              </div>

              <div className="w-full sm:w-1/2 pb-4">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Quick Link
                </h5>
                <div className="flex flex-col gap-4">
                  <Link
                    to="/about"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/about"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    Terms Of Use
                  </Link>
                  <Link
                    to="/contact"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    FAQ
                  </Link>
                  <Link
                    to="/contact"
                    className="font-poppins font-normal text-base text-[#fafafa] leading-6 hover:text-gray-300 transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              <div className="w-full sm:w-1/2 xl:w-[90%]">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Download App
                </h5>
                <div className="flex gap-2.5 pb-6 flex-wrap sm:flex-nowrap">
                  <div className="p-2">
                    <img src={qrCode} alt="QR Code" className="w-20" />
                  </div>
                  <div className="store flex flex-col gap-2 pt-2">
                    <a
                      href="https://play.google.com/store"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img src={playStore} alt="Play Store" />
                    </a>

                    <a
                      href="https://www.apple.com/app-store/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:opacity-80 transition-opacity"
                    >
                      <img src={appStore} alt="App Store" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-6 py-1 flex-wrap">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-poppins font-normal text-xl text-[#fafafa] hover:text-[#DB4444] transition-transform hover:scale-110"
                  >
                    <RiFacebookLine />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-poppins font-normal text-xl text-[#fafafa] hover:text-[#DB4444] transition-transform hover:scale-110"
                  >
                    <RiTwitterLine />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-poppins font-normal text-xl text-[#fafafa] hover:text-[#DB4444] transition-transform hover:scale-110"
                  >
                    <IoLogoInstagram />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-poppins font-normal text-xl text-[#fafafa] hover:text-[#DB4444] transition-transform hover:scale-110"
                  >
                    <RiLinkedinLine />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t-[0.5px] border-[rgba(255,255,255,0.1)]">
          <div className="container mx-auto">
            <p className="font-poppins font-normal text-base text-center text-[rgba(255,255,255,0.6)] leading-6 pt-4 pb-6 drop-shadow-2xl">
              <span className="pr-0.5 text-xl">©</span> Copyright Exclusive{' '}
              {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;