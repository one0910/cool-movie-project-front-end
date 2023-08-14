import React, { useRef, useEffect, ReactNode, useImperativeHandle, forwardRef } from 'react'
import * as bootstrap from 'bootstrap';
import styled from 'styled-components';

interface PopUpWindowsProps {
  children?: ReactNode;
  backgroundClose?: boolean
  status?: string
}

const PopUpWrap = styled.div<{ wrapStatus?: string }>`

  #staticBackdrop {
    background-color: rgba(0, 0, 0, 0.81);
    @media screen and (max-width: 768px){
      /* background-color: #0F0F0F; */
      background-color: ${props => (props.wrapStatus === "youtube") ? "rgba(0, 0, 0, 0.81)" : "#0F0F0F"};
    }
  }

  .modal-body aside{
    background-color: #0F0F0F;
  }
  .modal-dialog {
    @media screen and (min-width: 576px) {
      max-width: ${props => {
    if (props.wrapStatus === "youtube") {
      return '660px'
    }
  }};
    }
  }
  .popUpBtn{
    /* width: 100%; */
  }
`

const PopUpWindows = forwardRef(({ status, backgroundClose, children }: PopUpWindowsProps, ref) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const myModal = useRef<bootstrap.Modal | null>(null);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      myModal?.current?.show()
    },
    closeModal: () => {
      myModal?.current?.hide()
    },
  }));

  useEffect(() => {
    myModal.current = new bootstrap.Modal(modalRef.current as HTMLElement);
  }, []);

  return (
    <PopUpWrap wrapStatus={status}>
      <div className="modal fade" id="staticBackdrop" data-bs-keyboard="false" data-bs-backdrop={backgroundClose} tabIndex={-1} ref={modalRef}>
        <div className={`${(status === 'homeCheckSeat') ? 'modal-dialog modal-lg' : 'modal-dialog '}`}>
          <div className="modal-content modelWrap">
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </PopUpWrap>
  )
})

PopUpWindows.displayName = 'PopUpWindows';

export { PopUpWindows };
