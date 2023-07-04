import React, { useState, useContext, useEffect, useRef, MutableRefObject } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, useWatch, } from "react-hook-form"
import { ScreenCheck, PopUpWindows, MessageBox } from '../../components/';
import { OrderContext } from '../../store';
import { PopUpwindowRefType, CreditCardType, CompleteResDataType } from '../../interface';
import { authFetch } from '../../utilities';
import { Loading } from '../../components';
import io, { Socket } from "socket.io-client";

interface CheckPayProps { }


export const CheckPay: React.FC<CheckPayProps> = ({ }) => {
  const [state, dispatch] = useContext(OrderContext);
  const [loading, setLoading] = useState(false)
  const [bankcodes, setBankcodes] = useState([])
  const [completeResData, setCompleteResData] = useState<CompleteResDataType | null>(null)
  const [isPayComplete, setIsPayComplete] = useState(false)
  const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
  const socketIoRef = useRef<Socket>()
  const { register, handleSubmit, getValues, control, setError, formState: { errors } } = useForm<CreditCardType>();
  const navigate = useNavigate();
  const watchForm = useWatch({ control });
  const location = useLocation();
  const url = process.env.REACT_APP_REMOTE_URL || "http://localhost:3000"

  // 進入該頁時，載入銀行的代碼
  useEffect(() => {

    setLoading(true)
    socketIoRef.current = io(url, { transports: ['websocket'] });
    window.scrollTo({ top: 0, behavior: 'auto' });
    dispatch({
      type: "SET_LAST_PAGE",
      payload: {
        lastPage: location.pathname,
      },
    });
    (async function () {
      try {
        let response = await authFetch.get('https://9b71893b-9621-4845-b234-553e758f8f8a.mock.pstmn.io/bankcode')
        setBankcodes(response.data.bankcode)
        setLoading(false)
      } catch (error) {
        console.log('error', error);
      }
    }())
  }, [])

  //隨時監控form，若有錯誤，scroll移到最上方
  useEffect(() => {
    if (errors) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [watchForm])

  //按下一步時，跳出再次確認資訊的畫面
  const clickNextStep = (data: CreditCardType) => {
    popUpwindowRef.current?.openModal()
  };

  // 按下結帳
  const clickCheckPay = (data: CreditCardType) => {
    setLoading(true);

    (async function () {
      try {
        let response = await authFetch.post(`api/order`, {
          "status": state.orderList.status,
          "phoneNumber": (data.phoneNumber) ? data.phoneNumber : "",
          "email": (data.email) ? data.email : "",
          "memberId": state.orderList.memberId,
          "memberName": state.orderList.memberName,
          "movieId": state.orderList.movieId,
          "movie_name": state.orderList.movie_name,
          "movie_date": state.orderList.movie_date,
          "movie_time": state.orderList.movie_time,
          "movie_level": state.orderList.movie_level,
          "screenId": state.orderList.screenId,
          "seatOrdered": state.orderList.seat_ordered,
          "theater_size": state.orderList.theater_size,
          "quantity": state.orderList.quantity,
          "price": state.orderList.price,
          "total": state.total,
        })
        setTimeout(() => {
          setIsPayComplete(true)
          setCompleteResData(response.data.data)
          setLoading(false);
          socketIoRef?.current?.emit("order", {
            socketId: state.orderList.socketId,
            screenId: state.orderList.screenId,
            seatOrderedIndex: state.orderList.seat_orderedIndex,
          });
        }, 1000)
      } catch (error) {
        console.log('catch_error', error);
      }
    }())

  };
  let creditCardInputErrMsgDiv = null
  let creditCardExpirationErrMsgDiv = null
  let screenContent = null
  if (!isPayComplete) {
    screenContent =
      <ScreenCheck titleMsg={"請再次確認您的訂票資料是否無誤"}>
        {(state.orderList.status === "quick") &&
          <>
            <div className='d-flex justify-content-between mt-3 screenCheck pb-2 mb-0 border-bottom-0'>
              <span>手機號碼</span>
              <span>{getValues().phoneNumber}</span>
            </div>
            <div className='d-flex justify-content-between pb-2'>
              <span>電子郵件</span>
              <span>{getValues().email}</span>
            </div>
          </>
        }

        <div className='d-flex justify-content-between mt-3 screenCheck pb-2 mb-0 border-bottom-0'>
          <span>付款方式</span>
          <span>信用卡</span>
        </div>
        <div className='d-flex justify-content-between pb-2'>
          <span>銀行</span>
          <span>{getValues().bankCode}</span>
        </div>
        <div className='d-flex justify-content-between pb-2'>
          <span>信用卡卡號</span>
          <span>{`${getValues().creditCardNumber1}-${getValues().creditCardNumber2}-${getValues().creditCardNumber3}-${getValues().creditCardNumber4}`}</span>
        </div>
        <div className='d-flex justify-content-between'>
          <span>總計</span>
          <span>${state.total}</span>
        </div>
        <div className='d-flex justify-content-between'>
          <button type='button' className='btn_primary mt-4 me-1 w-100' onClick={() => {
            if (window.scrollY > 0) {
              window.scrollTo({ top: 0, behavior: 'auto' });
            }
            popUpwindowRef.current?.closeModal()
          }}>取消</button>
          <button type='button' className='btn_primary mt-4 ms-1 w-100' onClick={handleSubmit(clickCheckPay)}>結帳</button>
        </div>
      </ScreenCheck >
  } else {
    screenContent = <MessageBox >
      <>
        <div className='text-center'>
          <i className="bi bi-ticket-perforated color-primary fw-bold fs-2 me-3"></i>
          <strong className='color-primary fs-2'>訂票完成</strong>
        </div>
        <div className='orderedMovieInfo mt-3 mb-3 px-lg-4 py-lg-3 px-2 py-2 rounded'>
          <div className='d-flex justify-content-between'>
            <span className='title'>訂單編號</span>
            <span>{completeResData?.OrderId}</span>
          </div>
          <div className='d-flex justify-content-between mt-3'>
            <span className='title'>電影</span>
            <span>{completeResData?.MovieName}</span>
          </div>
          <div className='d-flex justify-content-between my-3'>
            <span className='title'>場次</span>
            <span>{`${completeResData?.MoviePlayDate}  ${completeResData?.MoviePlayTime}`}</span>
          </div>
          <div className='d-flex justify-content-between align-items-center seats'>
            <span className='title'>座位</span>
            <span>{completeResData?.OrderSeat}</span>
          </div>
        </div>
        <p className='mt-2 text-start text-lg-center'>可至您的電子信箱或使用本站查詢功能查閱您的訂票記錄</p>
        <button className='btn_primary me-1 w-100 mt-2' onClick={() => {
          popUpwindowRef.current?.closeModal()
          navigate('/')
        }}>確定</button>
      </>
    </MessageBox>

  }



  /*信用卡號錯誤補捉訊息判斷*/
  if (errors.creditCardNumber1?.message === "請輸入卡號" || errors.creditCardNumber2?.message === "請輸入卡號" || errors.creditCardNumber3?.message === "請輸入卡號" || errors.creditCardNumber4?.message === "請輸入卡號") {
    creditCardInputErrMsgDiv = <p className="error-Msg">請輸入卡號</p>
  } else if (errors.creditCardNumber1?.message === "卡號總共需輸入16碼" || errors.creditCardNumber2?.message === "卡號總共需輸入16碼" || errors.creditCardNumber3?.message === "卡號總共需輸入16碼" || errors.creditCardNumber4?.message === "卡號總共需輸入16碼") {
    creditCardInputErrMsgDiv = <p className="error-Msg">卡號總共需輸入16碼</p>
  } else {
    creditCardInputErrMsgDiv = null
  }

  /*信用卡號錯誤補捉訊息判斷*/
  if (errors.expirationMonth?.message === "請輸入信用卡有效月份(例:01/28)" || errors.expirationYear?.message === "請輸入信用卡有效年份(例如01/28)") {
    creditCardExpirationErrMsgDiv = <p className="error-Msg">欄位不可為空白</p>
  } else if (errors.expirationMonth?.message === "月份的有效輸入為01~12") {
    creditCardExpirationErrMsgDiv = <p className="error-Msg">月份的有效輸入為01~12</p>
  } else if (errors.expirationYear?.message === "請輸入年份，例如2024，則輸入24") {
    creditCardExpirationErrMsgDiv = <p className="error-Msg">請輸入年份，例如2024，則輸入24</p>
  } else {
    creditCardExpirationErrMsgDiv = null
  }

  return (
    <div className='container mb-5'>
      <Loading isActive={loading} />
      <div className="row">
        <div className="col-md-8">
          {
            (state.orderList.status === "quick") &&
            <div className='contactInfo'>
              <div className="mb-2 mt-4">
                <i className="bi bi-telephone-fill align-middle fs-5 color-primary"></i>
                <span className='ms-3 color-primary fw-bold'>訂購人聯絡資訊</span>
              </div>
              <div className='creditCardInput bg-2nd py-4 ps-3 rounded-1'>
                <div>
                  <span>手機號碼</span>:
                  <input type="text" size={30} maxLength={10} {...register('phoneNumber', { required: { value: true, message: '手機欄位為必填', }, minLength: { value: 10, message: '手機號碼必須為10碼', }, })} />
                </div>
                {errors.phoneNumber && (
                  <p className="error-Msg">{errors.phoneNumber.message}</p>
                )}
                <div className='mt-3'>
                  <span>電子郵件</span>:
                  <input type="text" size={30} {...register('email', { required: { value: true, message: '請輸入您的email', }, pattern: { value: /^\S+@\S+$/i, message: '您的email格式不正確', }, })} />
                </div>
                {errors.email && (
                  <p className="error-Msg">{errors.email.message}</p>
                )}
              </div>
            </div>
          }

          <div className="mb-2 mt-4">
            <i className="bi bi-credit-card-fill align-middle fs-5 color-primary"></i>
            <span className='ms-3 color-primary fw-bold'>付款方式 - 信用卡</span>
          </div>
          <div className='creditCardInput bg-2nd py-4 ps-3 rounded-1'>
            <img src="/images/creditCard.png" className='d-block creditCardImg' alt="" />
            <div className='mt-4'>
              <span>請選擇銀行</span>:
              <select {...register("bankCode", {
                required: {
                  value: true,
                  message: '請選擇銀行',
                }
              })}
              >
                <option value="">請選擇銀行</option>
                {
                  bankcodes?.map((bankcode, index) => {
                    return (
                      <option key={index} value={bankcode}>
                        {bankcode}
                      </option>
                    )
                  })
                }
              </select>
            </div>
            {errors.bankCode && (
              <p className="error-Msg">{errors.bankCode.message}</p>
            )}
            <div className='mt-3'>
              <span>請輸入卡號</span>:
              {/* <input type="text" size={2} maxLength={4} {...register("creditCardNumber", { required: { value: true, message: '卡號總共需輸入16碼', }, })} /> - */}
              <input type="text" size={3} maxLength={4} {...register('creditCardNumber1', { required: { value: true, message: '請輸入卡號', }, minLength: { value: 4, message: '卡號總共需輸入16碼', }, })} /> -
              <input type="text" size={3} maxLength={4} {...register('creditCardNumber2', { required: { value: true, message: '請輸入卡號', }, minLength: { value: 4, message: '卡號總共需輸入16碼', }, })} /> -
              <input type="text" size={3} maxLength={4} {...register('creditCardNumber3', { required: { value: true, message: '請輸入卡號', }, minLength: { value: 4, message: '卡號總共需輸入16碼', }, })} /> -
              <input type="text" size={3} maxLength={4} {...register('creditCardNumber4', { required: { value: true, message: '請輸入卡號', }, minLength: { value: 4, message: '卡號總共需輸入16碼', }, })} />
            </div>
            {creditCardInputErrMsgDiv}
            <div className='my-3'>
              <span>信用卡有效日期</span>:
              <input type="text" size={3} maxLength={2} {...register('expirationMonth', { required: { value: true, message: '請輸入信用卡有效月份(例:01/28)', }, pattern: { value: /^(0[1-9]|1[0-2])$/, message: '月份的有效輸入為01~12', }, })} /> -
              <input type="text" size={3} maxLength={2} {...register('expirationYear', { required: { value: true, message: '請輸入信用卡有效年份(例如01/28)', }, minLength: { value: 2, message: '請輸入年份，例如2024，則輸入24', }, })} />
              <small className='ms-2 text-secondary'>(月/年 例:01-28)</small>
            </div>
            {creditCardExpirationErrMsgDiv}
            <div className='securityNum'>
              <span>背面末3碼</span>:
              <input type="text" size={2} maxLength={3} {...register('securityNum', { required: { value: true, message: '欄位不可為空白', }, minLength: { value: 3, message: '安全碼為3碼數字', }, })} />
              <img src="/images/security_number.jpg" />
            </div>
            {errors.securityNum && (
              <p className="error-Msg">{errors.securityNum.message}</p>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <ScreenCheck>
            <button type='button' className='btn_primary me-1 w-100 mt-4' onClick={handleSubmit(clickNextStep)}>下一步</button>
            <PopUpWindows ref={popUpwindowRef} backgroundClose={false}>
              {screenContent}
            </PopUpWindows >
          </ScreenCheck>
        </div>
      </div>
    </div>
  );
}