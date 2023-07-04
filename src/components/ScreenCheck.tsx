import React, { useContext, ReactNode } from 'react'
import styled from 'styled-components';
import { OrderContext } from '../store';

const Aside = styled.aside`
  border: 10px solid;
  border-image-slice: 1;
  border-width: 2px;
  border-image-source: linear-gradient(90deg, #8D7129 0.62%, #E7C673 23.69%, #DDD2AC 51.62%, #E7C673 81.1%, #8D7129 99.93%);
  .screenCheck{
    padding: 17px 0 16px 0;
    margin: 8px 0 15px 0;
    border: 10px solid;
    border-image-slice: 1;
    border-width: 2px;
    border-left: 0;
    border-right: 0;
    border-image-source: linear-gradient(90deg, #8D7129 0.62%, #E7C673 23.69%, #DDD2AC 51.62%, #E7C673 81.1%, #8D7129 99.93%);
  }
  .seatCheck{
    display: flex;
    justify-content:space-between;
    span:nth-of-type(1){
      width:44%
    }
  }
  .movieInfo{
    span:nth-of-type(1){
      color:${props => props.theme.movieLevel};
      border:1px solid ${props => props.theme.movieLevel};
    }
  }
`

interface ScreenCheckProps {
  children?: ReactNode;
  titleMsg?: string
}

export const ScreenCheck: React.FC<ScreenCheckProps> = ({ titleMsg, children }) => {
  const [state, dispatch] = useContext(OrderContext);
  return (
    <Aside className='px-3 py-3 mt-5 mt-lg-4' >
      <i className={`align-middle fs-4 color-primary ${(titleMsg) ? "bi bi-ui-checks" : "bi bi-list-check"}`}></i>
      <span className='ms-3 color-primary fw-bold'>{titleMsg ? `${titleMsg}` : "您選定的場次"}</span>
      <div className="screenCheck">
        <div className='movieInfo d-flex justify-content-start mb-3'>
          <span className='px-1 me-2'>{state.orderList.movie_level}</span>
          <span className='border px-1'>{state.orderList.movie_length}</span>
        </div>
        <div className='d-flex justify-content-between mb-2'>
          <span>電影</span>
          <span>{state.orderList.movie_name}</span>
        </div>
        <div className='d-flex justify-content-between mb-2'>
          <span>日期</span>
          <span>{state.orderList.movie_date}</span>
        </div>
        <div className='d-flex justify-content-between'>
          <span>時間</span>
          <span>{state.orderList.movie_time}</span>
        </div>
      </div>
      <div className="theaterSizeCheck d-flex  justify-content-between mb-2">
        <span>影廳</span>
        <span>{state.orderList.theater_size}</span>
      </div>
      <div className="seatCheck mb-2">
        <span>座位</span>
        <span>{state.orderList.seat_ordered?.map(item => `[${item}]`).join('、')}</span>
      </div>
      {(!titleMsg) && <div className="priceCheck d-flex  justify-content-between">
        <span>總計</span>
        <span>${state.total}</span>
      </div>}
      {children}
    </Aside>
  );
}