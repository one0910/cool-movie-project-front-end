import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Pagination } from "swiper";
import { authFetch } from "../../../utilities";
import { Loading } from "../../../components";
import "swiper/css/pagination";
import { MovieDataType, PopUpwindowRefType } from "../../../interface";
import { PopUpWindows } from "../../../components";
SwiperCore.use([Pagination]);

interface HomeVideo { }

export const HomeVideo: React.FC<HomeVideo> = () => {
  const pagination = {
    clickable: true,
    bulletClass: "homeVideo-pagination-bullet",
    bulletActiveClass: "homeVideo-pagination-bullet-active",
  };
  const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
  const [movieHead, setMovieHead] = useState<MovieDataType | null>(null)
  const playerRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async function () {
      try {
        let response = await authFetch.get(`/api/movie/?isRelease=true&id=64ae4c60d9d95f336e14e45f`)
        setMovieHead(response.data.data.data)
      } catch (error) {
        console.log('error', error);
      }
    }())
  }, [])

  const onenYoutubeVideo = () => {
    setLoading(true)
    popUpwindowRef.current?.openModal()
    const iframe = document.createElement('iframe');
    iframe.src = movieHead?.videos[0] || "";
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    playerRef.current?.appendChild(iframe);
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  const closeModal = () => {
    popUpwindowRef.current?.closeModal()
    const iframe = playerRef.current?.querySelector('iframe');
    if (iframe) {
      playerRef.current?.removeChild(iframe);
    }
  }

  return (
    <>
      <Loading isActive={loading} />
      <div className="homeVideo">
        <PopUpWindows ref={popUpwindowRef} backgroundClose={false} status={"youtube"}>
          <div className='trailMovie mt-5' ref={playerRef}>
            <i className="bi bi-x" onClick={closeModal} ></i>
          </div>
        </PopUpWindows>
        <Swiper
          className="homeKv-swiper"
          slidesPerView={1}
        // pagination={pagination}
        >
          <SwiperSlide>
            <div className="homeVideo-content d-flex align-items-center flex-column flex-md-row">
              <div
                role="button"
                onClick={onenYoutubeVideo}
                className="homeVideo-img position-relative"
                style={{
                  backgroundImage: `url(${movieHead?.videoImg})`,

                }}
              >
                <div className="homeVideo-img-play position-absolute top-50 start-50 translate-middle">
                  <img src="/images/home/play-icon.png" />
                </div>
              </div>
              <div className="homeVideo-desc">
                <h3> {movieHead?.name}</h3>
                <p>
                  {movieHead?.desc}
                </p>
                <div className="homeVideo-buttons d-flex no-wrap">
                  <Link to={`/movie/${movieHead?.id}/true`} className="homeVideo-buttons-movie me-4">
                    電影簡介
                  </Link>
                  <Link to={`/movie/${movieHead?.id}/true`} className="homeVideo-buttons-order">
                    前往訂票
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>

        </Swiper>
      </div>
    </>
  );
};
