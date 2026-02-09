import React from 'react';
import footerLogo from '../../assets/Images/footerLogo.png';
import qrCode from '../../assets/Images/qrCode.png';
import appStore from '../../assets/Images/appStore.png';
import playStore from '../../assets/Images/playStore.png';
import { RiFacebookLine } from 'react-icons/ri';
import { RiTwitterLine } from 'react-icons/ri';
import { IoLogoInstagram } from 'react-icons/io';
import { RiLinkedinLine } from 'react-icons/ri';
import { GoPaperAirplane } from 'react-icons/go';

const Footer = () => {
  return (
    <>
      <footer className="bg-black">
        <div className="mx-4 lg:mx-0">
          <div className="container">
            <div className="flex flex-col flex-wrap lg:flex-nowrap sm:flex-row gap-10  pt-20 pb-[60px]">
              {/* LOGO + SUBSCRIBE */}
              <div className="w-full sm:w-1/2 lg:w-[26%]">
                <img src={footerLogo} alt="" className="w-[118px]" />
                <div className="py-6">
                  <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] py-6">
                    Subscribe
                  </h5>
                  <p className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Get 10% off your first order
                  </p>
                  <form className="pt-4 relative">
                    <div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="py-3 ps-4 w-full border border-[#fafafa] rounded-sm text-[#fafafa]"
                      />
                    </div>
                    <div className="absolute right-3 top-[29px]">
                      <GoPaperAirplane className="text-2xl text-[#fafafa]" />
                    </div>
                  </form>
                </div>
              </div>

              {/* SUPPORT */}
              <div className="w-full sm:w-1/2 lg:w-[20%]">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Support
                </h5>
                <div className="flex flex-col gap-4">
                  <p className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    111 Bijoy sarani, Dhaka, DH 1515, Bangladesh.
                  </p>
                  <p className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    exclusive@gmail.com
                  </p>
                  <p className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    +88015-88888-9999
                  </p>
                </div>
              </div>

              {/* ACCOUNT */}
              <div className="w-full sm:w-1/2 lg:w-[17%]">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Account
                </h5>
                <div className="flex flex-col gap-4">
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    My Account
                  </a>
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Login / Register
                  </a>
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Cart
                  </a>
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Wishlist
                  </a>
                </div>
              </div>

              {/* QUICK LINK */}
              <div className="w-full sm:w-1/2 lg:w-[17%]">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Quick Link
                </h5>
                <div className="flex flex-col gap-4">
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Privacy Policy
                  </a>
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Terms Of Use
                  </a>
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    FAQ
                  </a>
                  <a className="font-poppins font-normal text-base text-[#fafafa] leading-6">
                    Contact
                  </a>
                </div>
              </div>

              {/* DOWNLOAD APP */}
              <div className="w-full sm:w-1/2 lg:w-[20%]">
                <h5 className="font-poppins font-medium leading-7 text-xl text-[#fafafa] pb-6">
                  Download App
                </h5>
                <div className="flex gap-2.5 pb-6 flex-wrap sm:flex-nowrap">
                  <div className="p-2">
                    <img src={qrCode} alt="" className="w-20" />
                  </div>
                  <div className="store flex flex-col gap-2 pt-2">
                    <img src={playStore} alt="" />
                    <img src={appStore} alt="" />
                  </div>
                </div>
                <div className="flex gap-6 py-1 flex-wrap">
                  <a
                    href="#"
                    className="font-poppins font-normal text-lg text-[#fafafa] leading-6"
                  >
                    <RiFacebookLine />
                  </a>
                  <a
                    href="#"
                    className="font-poppins font-normal text-lg text-[#fafafa] leading-6"
                  >
                    <RiTwitterLine />
                  </a>
                  <a
                    href="#"
                    className="font-poppins font-normal text-lg text-[#fafafa] leading-6"
                  >
                    <IoLogoInstagram />
                  </a>
                  <a
                    href="#"
                    className="font-poppins font-normal text-lg text-[#fafafa] leading-6"
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
          <div className="container">
            <p className="font-poppins font-normal text-base text-center text-[rgba(255,255,255,0.6)] leading-6 pt-4 pb-6 drop-shadow-2xl drop-shadow-[rgba(0,0,0,0.25)]">
              <span className="pr-0.5 text-xl">©</span> Copyright Rimel 2022.
              All right reserved
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;