import React from 'react';
import categoryBanner from '../../assets/images/categoryBanner.png';
import { useCountdown } from '../../contexts/CountDownContext/CountDownContextProvider';
import { motion } from 'framer-motion';
import { Link } from 'react-router';

const CategoryBanner = () => {
  const { seconds, minutes, hours, days } = useCountdown();
  return (
    <>
      <section className="pb-17.5 hidden md:block">
        <div className="container">
          <div className="pt-17.25 ">
            <div className="slider-container">
              <div className="item">
                <div className="categoryBanner flex gap-6.75 justify-center items-center ps-16 pt-17.25 overflow-hidden">
                  <div className="w-[40%]">
                    <div className="">
                      <div className="pb-8">
                        <p className="font-poppins font-normal text-base leading-6 text-[#00FF66]">
                          Categories
                        </p>
                      </div>
                      <h2 className="font-inter font-semibold md:text-[36px] lg:text-[48px] leading[60px] pb-8 text-[#fafafa] tracking-[4%]">
                        Enhance Your Music Experience
                      </h2>
                      {/* timer component start */}
                      <div className="flex gap-6 items-center pb-11">
                        <div className="w-15.5 h-15.5 bg-white rounded-[50%] text-center py-auto px-auto flex flex-col justify-center items-center">
                          <h3 className="font-poppins font-semibold text-base leading-5 text-black">
                            {days >= 10 ? days : `0${days}`}
                          </h3>
                          <h4 className="font-poppins font-normal text-[11px] text-black leading-4.5 pb-1">
                            Days
                          </h4>
                        </div>
                        <div className="w-15.5 h-15.5 bg-white rounded-[50%] text-center py-auto px-auto flex flex-col justify-center items-center">
                          <h3 className="font-poppins font-semibold text-base leading-5 text-black">
                            {hours >= 10 ? hours : `0${hours}`}
                          </h3>
                          <h4 className="font-poppins font-normal text-[11px] text-black leading-4.5 pb-1">
                            Hours
                          </h4>
                        </div>
                        <div className="w-15.5 h-15.5 bg-white rounded-[50%] text-center py-auto px-auto flex flex-col justify-center items-center">
                          <h3 className="font-poppins font-semibold text-base leading-5 text-black">
                            {minutes >= 10 ? minutes : `0${minutes}`}
                          </h3>
                          <h4 className="font-poppins font-normal text-[11px] text-black leading-4.5 pb-1">
                            Minutes
                          </h4>
                        </div>
                        <div className="w-15.5 h-15.5 bg-white rounded-[50%] text-center py-auto px-auto flex flex-col justify-center items-center">
                          <h3 className="font-poppins font-semibold text-base leading-5 text-black">
                            {seconds >= 10 ? seconds : `0${seconds}`}
                          </h3>
                          <h4 className="font-poppins font-normal text-[11px] text-black leading-4.5 pb-1">
                            Seconds
                          </h4>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center mb-16.25">
                        <Link
                          to="/checkout"
                          className="bg-[#00FF66] hover:bg-[#00ff66de] duration-300 hover:text-white text-center py-4 px-12 rounded-sm font-poppins font-medium text-base text-[#fafafa] leading-6"
                        >
                          Buy Now!
                        </Link>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotateY: -360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 60,
                      ease: 'linear',
                    }}
                    className="w-[60%] flex justify-end me-11 p-2 relative"
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-full z-10 animate-spin-slow">
                      <img
                        src={categoryBanner}
                        alt="banner"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CategoryBanner;
