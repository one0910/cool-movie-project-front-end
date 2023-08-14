import React, { useRef } from 'react'
import { convertPlayDateFormat } from '../../../utilities';
import { OrderDataType } from '../../../interface';
import { PopUpWindows } from '../../../components';
import { PopUpwindowRefType } from '../../../interface';
import { ScreenCheck } from '../../../components';

export const OrderList: React.FC<OrderDataType> = (order) => {
  const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
  const openOrderDetail = () => {
    popUpwindowRef.current?.openModal()
  }

  return (
    <>
      <li className="orderContentList" >
        <ul className="orderContentListWrap" onClick={openOrderDetail}>
          <li>{convertPlayDateFormat(order.createTime).dateNoweekday}</li>
          <li>{`${order.movieName}(${order.movielevel})`}</li>
          <li>{`${order.moviePlayDate} ${order.moviePlayTime}`}</li>
          <li>{order.seatOrdered.map(seat => seat).join('、')}</li>
          <li>查看明細</li>
        </ul>
      </li>
      <PopUpWindows ref={popUpwindowRef} backgroundClose={true}>
        <ScreenCheck titleMsg={"訂單明細"} order={order}>
          <div className='d-flex justify-content-between mt-3 screenCheck pb-2 mb-0 border-bottom-0'>
            <span>付款方式</span>
            <span>信用卡</span>
          </div>
          <div className='d-flex justify-content-between'>
            <span>費用總計</span>
            <span>${order.total}</span>
          </div>
          <button type='button' className='btn_primary me-1 w-100 mt-4' onClick={() => { popUpwindowRef.current?.closeModal() }}>確定</button>
        </ScreenCheck>
      </PopUpWindows >
    </>
  );
}