import React, { useRef, useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { OrderContext } from '../../store';
import { ScreenCheck, PopUpWindows, MessageBox } from '../../components/';
import { PopUpwindowRefType } from '../../interface';
import { authFetch } from '../../utilities';
import { Loading } from '../../components';
import { CompleteResDataType } from '../../interface';
interface CheckCompleteProps {

}

export const CheckComplete: React.FC<CheckCompleteProps> = ({ }) => {
  const [state, dispatch] = useContext(OrderContext);
  const orderId = useParams().orderId
  const [loading, setLoading] = useState(false)
  const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
  const navigate = useNavigate();
  const [completeOrderData, setCompleteOrderData] = useState<{
    id: string,
    movieName: string,
    moviePlayDate: string,
    moviePlayTime: string,
    seatOrdered: []
    theater_size: string,
    status: string
  } | null>(null)

  useEffect(() => {
    setLoading(true);
    popUpwindowRef.current?.openModal();
    (async function () {
      try {
        let response = await authFetch.get(`api/order/getOrderData/?orderId=${orderId}`)
        setCompleteOrderData(response.data.data)
        dispatch({
          type: "ADD_ORDER_FROM_HOME",
          payload: {
            memberMail: response.data.data.userEmail,
          },
        });
        setLoading(false)
      } catch (error) {
        console.log('error', error);
      }
    }())
  }, [])
  return (
    <>
      {/* <h1>結帳完成</h1> */}

      <PopUpWindows ref={popUpwindowRef} backgroundClose={false}>
        <Loading isActive={loading} />
        <MessageBox >
          <div className='text-center'>
            <i className="bi bi-ticket-perforated color-primary fw-bold fs-2 me-3"></i>
            <strong className='color-primary fs-2'>訂票完成</strong>
          </div>
          <div className='orderedMovieInfo mt-3 mb-3 px-lg-4 py-lg-3 px-2 py-2 rounded'>
            <div className='d-flex justify-content-between'>
              <span className='title'>訂單編號</span>
              <span>{completeOrderData?.id}</span>
            </div>
            <div className='d-flex justify-content-between mt-3'>
              <span className='title'>電影</span>
              <span>{`${completeOrderData?.movieName} (${completeOrderData?.theater_size})`}</span>
            </div>
            <div className='d-flex justify-content-between my-3'>
              <span className='title'>場次</span>
              <span>{`${completeOrderData?.moviePlayDate} ${completeOrderData?.moviePlayTime}`}</span>
            </div>
            <div className='d-flex justify-content-between align-items-center seats'>
              <span className='title'>座位</span>
              <span>{completeOrderData?.seatOrdered.map(item => `[${item}]`).join(' ')}</span>
            </div>
          </div>
          <p className='mt-2 text-start text-lg-center'>可至您的電子信箱或使用本站查詢功能查閱您的訂票記錄</p>
          {(completeOrderData?.status === "member") ?
            <div className='d-flex justify-content-between'>
              <button type='button' className='btn_primary mt-4 me-1 w-100' onClick={() => {
                popUpwindowRef.current?.closeModal()
                navigate('/member')
              }}>會員中心
              </button>
              <button type='button' className='btn_primary mt-4 ms-1 w-100' onClick={() => {
                popUpwindowRef.current?.closeModal()
                navigate('/')
              }}>確定
              </button>
            </div> :
            <button className='btn_primary me-1 w-100 mt-2' onClick={() => {
              popUpwindowRef.current?.closeModal()
              navigate('/')
            }}>確定</button>
          }
        </MessageBox>
      </PopUpWindows >
    </>
  );
}