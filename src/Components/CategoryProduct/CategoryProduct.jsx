import React, { useEffect, useState } from 'react'
import explore from '../../assets/images/explore.png'
import { FaStar } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { useShop } from '../../Context/ShopContext/ShopContext';

const CategoryProduct = () => {

    const { addToCart, addToWishlist } = useShop();
    const [cateProducts, setCateProducts] = useState([])
    const { slug } = useParams()
    console.log(slug);
        
    useEffect(() => {

        axios
            .get(`https://dummyjson.com/products/category/${slug}`)
            .then(res => setCateProducts(res.data.products))
            .catch(err => console.error(err))
    }, [slug]);

    const [visibleCount, setVisibleCount] = useState(4)

  return (
    <>
      <section className="pt-8">
        <div className="container">
          <div className="pb-15">
            <h4 className='font-inter font-semibold text-[16px] leading-5 text-[#DB4444] pl-8.5 relative after:w-5 after:h-10 after:absolute after:content-[""] after:-top-2.5 after:left-0 after:bg-red-500 after:rounded-sm'>
              Category
            </h4>
            <h2 className="pt-8.5 font-inter font-semibold text-[36px] leading-12 text-[#DB4444]">
              {' '}
              {slug}
            </h2>
          </div>

          <div className="grid grid-cols-4 pb-19 gap-x-7.5 gap-y-15">
            {cateProducts.slice(0, visibleCount).map((product, index) => (
              <div key={index}>
                <div className="bg-[#F5F5F5] py-8.75 group rounded-sm mb-4 relative overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img className="mx-auto" src={product.thumbnail} alt="" />
                  </Link>

                  <button
                    onClick={() => addToCart(product)}
                    className="bg-black absolute left-0 -bottom-10 w-full py-2 font-poppins font-medium text-[16px] leading-6 text-white text-center rounded-b-sm group-hover:bottom-0 duration-300"
                  >
                    Add To Cart
                  </button>
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => addToWishlist(product)}
                      className="w-8.5 h-8.5 bg-white rounded-full flex justify-center items-center mb-2"
                      aria-label="Add to wishlist"
                    >
                      <FaRegHeart />
                    </button>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-8.5 h-8.5 bg-white rounded-full flex justify-center items-center"
                      aria-label="View details"
                    >
                      <IoEyeOutline />
                    </Link>
                  </div>
                </div>
                <h3 className="font-poppins font-medium text-black text-[16px] leading-6 pb-2">
                  <Link to={`/product/${product.id}`}>{product.title}</Link>
                </h3>
                <div className="flex gap-2 items-center">
                  <div>
                    <p className="font-poppins font-medium text-[#DB4444] text-[16px] leading-6 flex gap-3">
                      ${product.price}
                    </p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaStar className="text-[#FFAD33] text-[20px]" />
                    <FaStar className="text-[#FFAD33] text-[20px]" />
                    <FaStar className="text-[#FFAD33] text-[20px]" />
                    <FaStar className="text-[rgba(0,0,0,0.25)] text-[20px]" />
                    <FaStar className="text-[rgba(0,0,0,0.25)] text-[20px]" />
                  </div>
                  <div className="">
                    <span className="font-poppins font-semibold text-[rgba(0,0,0,0.5)] text-[14px] leading-5">
                      (35)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < cateProducts.length && (
            <div className="pb-22.75 text-center">
              <a
                onClick={() => setVisibleCount(visibleCount + 4)}
                className="px-12 py-4 bg-[#DB4444] text-[#fafafa] text-[16px] leading-6 font-poppins font-medium rounded-sm"
              >
                View More Products
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default CategoryProduct