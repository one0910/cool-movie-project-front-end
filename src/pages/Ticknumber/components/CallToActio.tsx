import React, { useState, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components';
import { Login } from '../../../components';


const Figure = styled.figure<{ isLogin: boolean }>`
  display:${(props) => {
    if (props.isLogin) {
      return "none"
    } else {
      return "block"
    }
  }};
`
interface CallToActioProps {
  isLogin: boolean;
  setIsLogin?: Dispatch<SetStateAction<boolean>>
}

export const CallToActio: React.FC<CallToActioProps> = (props) => {
  const [isLogin, setIsLogin] = useState(false);
  return (
    <Figure className='joinMember mt-1 mb-4 shadow' isLogin={props.isLogin}>
      <div className='mb-2'>
        <i className="bi bi-person-hearts align-middle fs-5 color-primary"></i>
        <span className='ms-3 color-primary fw-bold'>加入會員</span>
      </div>
      <div className="bg-2nd py-4 ps-3 rounded-1">
        <div className='m-0 d-inline-block'>
          {/* <button type='button' className='btn_primary me-2 me-lg-3'>加入會員</button> */}
          <Login setIsLogin={setIsLogin} LoingMsg={"加入會員"} LoginStatus={"signup"} />
          <span className='ms-3'>立即享有全影廳50元折扣</span>
        </div>
      </div>
    </Figure>
  );
}
