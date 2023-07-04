import React from "react";
import { Link } from "react-router-dom";


interface HomeMovieCard {
  isShowing?: boolean;
}

export const HomeMovieCard: React.FC<any> = (props) => {
  const { isShowing, name, imgs, releaseData, _id } = props
  const date = new Date(releaseData);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}/${month}/${day}`;
  return (
    <div className="homeMovieCard general homeMovieCard-showing">
      <Link to={`/movie/${_id}/${isShowing}`}>
        <button className="homeMovieCard-order">{(isShowing) ? "線上訂票" : "即將上映"}</button>
        <div className="homeMovieCard-img overflow-hidden">
          <img src={imgs?.[0]} />
          {/* <img src="https://fakeimg.pl/306x438/?text=1" /> */}

        </div>
        <div className="homeMovieCard-content">
          <p className="homeMovieCard-title">{name}</p>
          <p className="homeMovieCard-time d-flex justify-content-between align-items-center">
            <span>上映日期:</span>
            <span>{formattedDate}</span>
          </p>
        </div>
      </Link>
    </div>
  );
};
