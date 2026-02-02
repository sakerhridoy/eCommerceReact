import React from 'react'
import newArrival1 from '../../assets/Images/newArrrivals1.png'
import newArrival2 from '../../assets/Images/newArrrivals2.png'
import newArrival3 from '../../assets/Images/newArrrivals3.png'
import newArrival4 from '../../assets/Images/newArrrivals4.png'
import { Link } from 'react-router'

const NewArrival = () => {
  return (
    <>
      <section className="pb-[140px]">
        <div className="container">
          <div className="section-title mb-[60px]">
            <div className="mb-5 relative after:absolute after:content-[''] after:w-5 after:h-full after:bg-[#DB4444] after:left-0 after:top-0 after:rounded-sm ps-9">
              <h4 className="font-poppins font-semibold text-base text-[#DB4444] leading-10">
                Featured
              </h4>
            </div>
            <div className="heading">
              <h2 className="font-inter font-semibold text-4xl text-black leading-12 tracking-[4%]">
                New Arrival
              </h2>
            </div>
          </div>
          <div className="flex gap-[30px]">
            <div className="w-1/2 bg-black pt-[90px] px-[30px] rounded-sm relative">
              <img className="w-[511px] h-[511px]" src={newArrival1} alt="" />
              <div className="w-[242px] absolute bottom-8 left-8">
                <h4 className="font-inter font-semibold text-2xl text-[#fafafa] leading-6">
                  PlayStation 5
                </h4>
                <p className="font-poppins font-normal text-sm text-[#fafafa] leading-[21px] py-4">
                  Black and White version of the PS5 coming out on sale.
                </p>
                <Link
                  to="/shop"
                  className="font-poppins font-medium text-base text-white leading-6 border-b border-white/50"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-8">
              <div className="h-1/2 bg-black ps-[138px] rounded-sm relative">
                <img
                  className="w-[432px] h-full rounded-tr-sm rounded-br-sm"
                  src={newArrival2}
                  alt=""
                />
                <div className="w-[242px] absolute bottom-8 left-8">
                  <h4 className="font-inter font-semibold text-2xl text-[#fafafa] leading-6">
                    Women’s Collections
                  </h4>
                  <p className="font-poppins font-normal text-sm text-[#fafafa] leading-[21px] py-4">
                    Featured woman collections that give you another vibe.
                  </p>
                  <Link
                    to="/shop"
                    className="font-poppins font-medium text-base text-white leading-6 border-b border-white/50"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
              <div className="h-1/2 flex gap-[30px]">
                <div className="w-1/2 speakers py-[31px] px-[30px] relative rounded-sm">
                  <img src={newArrival3} alt="" />
                  <div className="w-[191px] absolute bottom-8 left-8">
                    <h4 className="font-inter font-semibold text-2xl text-[#fafafa] leading-6">
                      Speakers
                    </h4>
                    <p className="font-poppins font-normal text-sm text-[#fafafa] leading-[21px] py-2">
                      Amazon wireless speakers
                    </p>
                    <Link
                      to="/shop"
                      className="font-poppins font-medium text-base text-white leading-6 border-b border-white/50"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
                <div className="w-1/2 perfume py-[31px] px-[30px] relative rounded-sm">
                  <img src={newArrival4} alt="" />
                  <div className="w-[191px] absolute bottom-8 left-8">
                    <h4 className="font-inter font-semibold text-2xl text-[#fafafa] leading-6">
                      Perfume
                    </h4>
                    <p className="font-poppins font-normal text-sm text-[#fafafa] leading-[21px] py-2">
                      GUCCI INTENSE OUD EDP
                    </p>
                    <Link
                      to="/shop"
                      className="font-poppins font-medium text-base text-white leading-6 border-b border-white/50"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default NewArrival