import React from 'react';
import { Link } from 'react-router';
import { CiShop } from 'react-icons/ci';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { BsBag } from 'react-icons/bs';
import { FaSackDollar } from 'react-icons/fa6';
import { CiTwitter } from 'react-icons/ci';
import { FiInstagram } from 'react-icons/fi';
import { RiLinkedinLine } from 'react-icons/ri';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import aboutImg from '../../assets/images/about.png';
import team1 from '../../assets/images/team1.png';
import team2 from '../../assets/images/team2.png';
import Services from '../Services/Services';


const About = () => {
  return (
    <section className="pb-35 px-4 xl:px-0">
      <div className="container">
        {/* BREADCRUMB */}
        <p className="text-sm text-black/50 py-10 lg:py-20 font-poppins font-normal leading-5.25">
          <Link to="/">Home</Link> / <span className="text-black">About</span>
        </p>

        {/* ================= OUR STORY ================= */}
        <div className="relative grid lg:grid-cols-2 gap-20 items-center lg:pb-35 lg:pt-34.25">
          <div>
            <h2 className="font-inter font-semibold text-[54px] leading-16 pb-10 text-black">
              Our Story
            </h2>
            <p className="text-black font-poppins font-normal text-base leading-6.5 pr-4 mb-6">
              Launched in 2015, Exclusive is South Asia’s premier online
              shopping marketplace with an active presence in Bangladesh.
              Supported by a wide range of tailored marketing, data and service
              solutions, Exclusive has 10,500 sellers and 300 brands and serves
              3 million customers across the region.
            </p>
            <p className="text-black font-poppins font-normal text-base leading-6.5 pr-4">
              Exclusive has more than 1 Million products to offer, growing at a
              very fast pace. Exclusive offers a diverse assortment in
              categories ranging from consumer.
            </p>
          </div>
          <div></div>
        </div>
        <div className="absolute right-0 top-85 w-[50%] h-152.25 hidden lg:block">
          <img
            src={aboutImg}
            alt="Our Story"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="container">
        {/* ================= STATS ================= */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-2 lg:gap-8 mt-10 md:mt-24">
          {[
            {
              icon: <CiShop />,
              value: '10.5k',
              text: 'Sellers active on site',
            },
            {
              icon: <AiOutlineDollarCircle />,
              value: '33k',
              text: 'Monthly Product Sale',
              active: true,
            },
            {
              icon: <BsBag />,
              value: '45.5k',
              text: 'Customer active on site',
            },
            {
              icon: <FaSackDollar />,
              value: '25k',
              text: 'Annual gross sale on site',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`border rounded-sm py-7.5 flex flex-col items-center gap-3 group ${
                item.active
                  ? 'bg-[#DB4444] text-white border-[#DB4444]'
                  : 'border-black/30 hover:bg-[#DB4444] hover:text-white transition hover:border-[#DB4444]'
              }`}
            >
              <div
                className={`w-14.5 h-14.5 rounded-full border-10  flex items-center justify-center text-3xl group-hover:border-[rgba(47,46,48,0.1)] group-hover:bg-white group-hover:text-black transition duration-300 ${
                  item.active
                    ? 'bg-white text-black border-[rgba(47,46,48,0.1)]'
                    : 'bg-black text-white border-[rgba(255,255,255,0.6)]'
                }`}
              >
                {item.icon}
              </div>
              <h3 className="text-[32px] font-inter leading-7.5 tracking-[4%] font-bold pt-6">
                {item.value}
              </h3>
              <p className="text-base md:text-xs lg:text-base font-poppins font-normal leading-6 pt-3">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* ================= TEAM ================= */}
        <div className="my-35">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            loop
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: '.team-pagination',
              renderBullet: (index, className) =>
                `<span class="${className} custom-dot"></span>`,
            }}
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-16"
          >
            {[
              { img: team1, name: 'Tom Cruise', role: 'Founder & Chairman' },
              { img: team2, name: 'Emma Watson', role: 'Managing Director' },
              { img: team1, name: 'Will Smith', role: 'Product Designer' },
              { img: team1, name: 'Tom Cruise', role: 'Founder & Chairman' },
              { img: team2, name: 'Emma Watson', role: 'Managing Director' },
              { img: team1, name: 'Will Smith', role: 'Product Designer' },
            ].map((member, i) => (
              <SwiperSlide key={i}>
                <div>
                  <div className="bg-[#F5F5F5] rounded-sm pt-9.5 px-5.5">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="mx-auto mb-6"
                    />
                  </div>

                  <h4 className="text-[32px] font-inter text-black font-medium pt-8">
                    {member.name}
                  </h4>

                  <p className="text-black font-poppins font-normal text-base leading-6 pt-2">
                    {member.role}
                  </p>

                  <div className="flex gap-4 mt-4">
                    <CiTwitter className="text-2xl" />
                    <FiInstagram className="text-xl" />
                    <RiLinkedinLine className="text-xl" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="team-pagination flex justify-center gap-3 mt-8"></div>
        </div>
        <Services className="pb-0" />
      </div>
    </section>
  );
};

export default About;
