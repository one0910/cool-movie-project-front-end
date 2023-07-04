import React, { ReactNode } from 'react'
import styled from 'styled-components';

const MsgDiv = styled.div`
  border: 10px solid;
  border-image-slice: 1;
  border-width: 2px;
  border-image-source: linear-gradient(90deg, #8D7129 0.62%, #E7C673 23.69%, #DDD2AC 51.62%, #E7C673 81.1%, #8D7129 99.93%);
  box-shadow: 0px 0px 5px #fff, 0px 0px 0px #fff, 0px 0px 0px #fff, 0px 0px 0px #fff, 0px 0px 0px #fff, 0px 0px 0px #fff, 0px 0px 0px #fff;
  background-color: #0F0F0F;
`

interface MessageBoxProps {
  children: ReactNode
}

export const MessageBox: React.FC<MessageBoxProps> = ({ children }) => {
  return (
    <MsgDiv className='px-3 py-3 mt-5 mt-lg-4'>
      {children}
    </MsgDiv>
  );
}