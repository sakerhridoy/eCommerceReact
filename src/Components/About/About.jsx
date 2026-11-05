import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import Testimonials from '../Testimonials/Testimonials';
import api from '../../api/client';
import SEO from '../SEO';

const About = () => {
  const [aboutData, setAboutData] = useState({
    title: 'Our Story',
    paragraph1:
      'Launched in 2015, Exclusive is South Asia’s premier online shopping marketplace with an active presence in Bangladesh. Supported by a wide range of tailored marketing, data and service solutions, Exclusive has 10,500 sellers and 300 brands and serves 3 million customers across the region.',
    paragraph2:
      'Exclusive has more than 1 Million products to offer, growing at a very fast pace. Exclusive offers a diverse assortment in categories ranging from consumer.',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await api.get('/about');
        if (data?.data) {
          setAboutData({
            title: data.data.title || 'Our Story',
            paragraph1: data.data.paragraph1 || aboutData.paragraph1,
            paragraph2: data.data.paragraph2 || aboutData.paragraph2,
            imageUrl: data.data.imageUrl || '',
          });
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };
    fetchAbout();
  }, []);

  return (
    <section className="pb-35 px-4 xl:px-0 font-poppins">
      <SEO
        title="About Us"
        description="Exclusive is South Asia's premier online shopping marketplace — 10,500+ sellers, 300 brands, and millions of happy customers."
      />
      <div className="container mx-auto">
        <p className="text-sm text-black/50 py-10 lg:py-20 font-normal leading-5.25">
          <Link to="/">Home</Link> / <span className="text-black">About</span>
        </p>

        {/* ================= OUR STORY ================= */}

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center lg:pb-35 lg:pt-10">
          <div className="pr-0 lg:pr-5">
            <h2 className="font-inter font-semibold text-[40px] md:text-[54px] leading-tight pb-8 text-black">
              {aboutData.title}
            </h2>
            <p className="text-black font-normal text-base leading-6.5 mb-6 text-justify">
              {aboutData.paragraph1}
            </p>
            <p className="text-black font-normal text-base leading-6.5 text-justify">
              {aboutData.paragraph2}
            </p>
          </div>

          <div className="hidden lg:block w-full">
            <img
              src={
                aboutData?.imageUrl?.startsWith('http')
                  ? aboutData.imageUrl // Cloudinary er url hole sothik vabe bosbe
                  : `${import.meta.env.VITE_API_BASE_URL}${aboutData?.imageUrl}`
              }
              alt={aboutData.title || 'Our Story'}
              className="w-full h-auto object-contain rounded-sm"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto">
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
                className={`w-14.5 h-14.5 rounded-full border-10 flex items-center justify-center text-3xl group-hover:border-[rgba(47,46,48,0.1)] group-hover:bg-white group-hover:text-black transition duration-300 ${
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
              <p className="text-base md:text-xs lg:text-base font-normal leading-6 pt-3">
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

                  <p className="text-black font-normal text-base leading-6 pt-2">
                    {member.role}
                  </p>

                  <div className="flex gap-4 mt-4">
                    <CiTwitter className="text-2xl cursor-pointer hover:text-[#DB4444] transition-colors" />
                    <FiInstagram className="text-xl cursor-pointer hover:text-[#DB4444] transition-colors" />
                    <RiLinkedinLine className="text-xl cursor-pointer hover:text-[#DB4444] transition-colors" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="team-pagination flex justify-center gap-3 mt-8"></div>
        </div>

        <Testimonials className="mb-35" />

        <Services className="pb-0" />
      </div>
    </section>
  );
};

export default About;