import React from 'react';
import { TbTruckDelivery } from 'react-icons/tb';
import { TfiHeadphoneAlt } from 'react-icons/tfi';
import { GoShieldCheck } from 'react-icons/go';
import { HiOutlineArrowSmallUp } from 'react-icons/hi2';

const Services = ({ className = '' }) => {
  // SCROLL TO TOP FUNCTION
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <section className="pb-[140px]">
        <div className="container relative">
          <div className="flex gap-[88px] justify-center">
            {/* CARD 1 */}
            <div className="w-[22%] text-center">
              <div className="w-20 h-20 bg-[rgba(47,46,48,0.3)] rounded-full p-[11px] text-center mx-auto">
                <div className="w-[58px] h-[58px] bg-black rounded-full p-[11px] text-center">
                  <TbTruckDelivery className="text-white text-4xl" />
                </div>
              </div>
              <div className="pt-6">
                <h4 className="font-poppins font-semibold text-xl text-black pb-2">
                  FREE AND FAST DELIVERY
                </h4>
                <p className="font-poppins text-sm text-black">
                  Free delivery for all orders over $140
                </p>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="w-[22%] text-center">
              <div className="w-20 h-20 bg-[rgba(47,46,48,0.3)] rounded-full p-[11px] text-center mx-auto">
                <div className="w-[58px] h-[58px] bg-black rounded-full p-[11px] text-center">
                  <TfiHeadphoneAlt className="text-white text-4xl transform scale-x-[-1]" />
                </div>
              </div>
              <div className="pt-6">
                <h4 className="font-poppins font-semibold text-xl text-black pb-2">
                  24/7 CUSTOMER SERVICE
                </h4>
                <p className="font-poppins text-sm text-black">
                  Friendly 24/7 customer support
                </p>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="w-[22%] text-center">
              <div className="w-20 h-20 bg-[rgba(47,46,48,0.3)] rounded-full p-[11px] text-center mx-auto">
                <div className="w-[58px] h-[58px] bg-black rounded-full p-[11px] text-center">
                  <GoShieldCheck className="text-white text-4xl" />
                </div>
              </div>
              <div className="pt-6">
                <h4 className="font-poppins font-semibold text-xl text-black pb-2">
                  MONEY BACK GUARANTEE
                </h4>
                <p className="font-poppins text-sm text-black">
                  We return money within 30 days
                </p>
              </div>
            </div>
          </div>

          {/* SCROLL TO TOP BUTTON */}
          <div
            onClick={scrollToTop}
            className="bg-[#F5F5F5] w-[46px] h-[46px] p-[13px] rounded-full cursor-pointer text-center absolute -bottom-28 -right-11"
          >
            <HiOutlineArrowSmallUp className="text-xl text-black font-bold" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;