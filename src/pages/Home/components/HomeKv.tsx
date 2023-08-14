import React from "react";
import { Autoplay } from "swiper";

import { Swiper, SwiperSlide } from "swiper/react";

interface HomeKvProps {
  children?: React.ReactNode;
}

export const HomeKv: React.FC<HomeKvProps> = ({ children }) => {
  return (
    <div className="homeKv">
      <div className="bannerTitle text-center">
        <h1>奢華沉浸，非凡感官</h1>
      </div>
      <Swiper
        className="homeKv-swiper"
        modules={[Autoplay]}
        slidesPerView={1}
        loop={true}
        speed={2000}
        autoplay={{
          delay: 2000,
          pauseOnMouseEnter: true,
          disableOnInteraction: false,
        }}
      >
        <SwiperSlide>
          <picture>
            <img src="/images/home/banner.jpg" />
          </picture>
        </SwiperSlide>
      </Swiper>
      {children}
    </div>
  );
};
