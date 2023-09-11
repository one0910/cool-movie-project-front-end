import React, { useRef, useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { OrderContext } from '../../store';
import { ScreenCheck, PopUpWindows, MessageBox } from '../../components';
import { PopUpwindowRefType } from '../../interface';
import { authFetch } from '../../utilities';
import { Loading } from '../../components';
import { CompleteResDataType } from '../../interface';
interface CheckFailProps {

}

export const CheckFail: React.FC<CheckFailProps> = ({ }) => {
  const [loading, setLoading] = useState(false)
  const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    popUpwindowRef.current?.openModal();
  }, [])
  return (
    <>
      <PopUpWindows ref={popUpwindowRef} backgroundClose={false}>
        <Loading isActive={loading} />
        <MessageBox >
          <div className='text-center'>
            <i className="bi bi-ticket-perforated color-primary fw-bold fs-2 me-3"></i>
            <strong className='color-primary fs-2'>訂票失敗</strong>
          </div>
          <div className='orderedMovieInfo mt-2 px-lg-4 py-lg-3 px-2 py-2 rounded'>
            <p>付款不成功，由於您在信用卡輸入的畫面閒置超過10分鐘，所以無法完成結帳流程，請再重新訂票，感謝您的諒解，謝謝</p>
          </div>
          <button className='btn_primary me-1 w-100 mt-1' onClick={() => {
            popUpwindowRef.current?.closeModal()
            navigate('/')
          }}>確定</button>
        </MessageBox>
      </PopUpWindows >
    </>
  );
}