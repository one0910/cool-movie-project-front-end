import React, { useState, useRef, useEffect, Dispatch, SetStateAction, useContext } from 'react'
import * as bootstrap from 'bootstrap';
import { SingIn, SignUp } from './';
import styled from 'styled-components';

const LoingBtn = styled.button<{ LoingMsg: string, variable?: string }>`
	width:${({ variable }) => (variable === "fromseats") ? "50%" : "auto"};
	background-color: ${({ LoingMsg }) => {
		if (LoingMsg === "加入會員") {
			return "#E7C673"
		} else {
			return "transparent"
		}
	}};
	color:${({ LoingMsg }) => (LoingMsg === "加入會員") ? "#000" : "#E7C673"};
	border: 1px solid #E7C673;
	padding: ${({ LoingMsg }) => {
		if (LoingMsg === "登入 / 註冊") {
			return "5px 11px"
		} else {
			return "7px 11px"
		}
	}};
	:hover{
		background-color: #E7C673;
	}
	:focus{
		background-color: transparent;
		color: #E7C673;
		box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.5);
	}
	@media screen and (max-width: 768px){
		padding:${({ variable }) => (variable === "fromseats") ? "7px 11px" : " 4px 8px"};
	}
`

interface LoginProps {
	isLogin?: boolean
	setIsLogin: Dispatch<React.SetStateAction<boolean>>
	LoingMsg: string
	LoginStatus: string
	variable?: string
}

export const Login: React.FC<LoginProps> = ({ variable, LoginStatus, LoingMsg, setIsLogin }) => {
	const [currentTab, setCurrentTab] = useState(LoginStatus)
	const modalRef = useRef<HTMLDivElement | null>(null);
	const myModal = useRef<bootstrap.Modal | null>(null);
	let zIndex = (LoginStatus === "login") ? 1035 : 9999;
	let openModal = () => {
		myModal?.current?.show()
	}
	useEffect(() => {
		myModal.current = new bootstrap.Modal(modalRef.current as HTMLElement);
	}, []);
	// console.log(' currentTab=> ', currentTab)
	return (
		<>
			<LoingBtn type="button" className="btn " onClick={openModal} LoingMsg={LoingMsg} variable={variable}>
				{LoingMsg}
			</LoingBtn>
			<div className="modal fade" id="staticBackdrop" data-bs-keyboard="false" tabIndex={-1} ref={modalRef} style={{ zIndex: zIndex }}>
				<div className="modal-dialog">
					<div className="modal-content modelWrap">
						<div className="modal-body">
							<div className="form-wrap">
								<i className="bi bi-x" data-bs-dismiss="modal"></i>
								<div className="tabs">
									<h6 className="login-tab">
										<button
											type='button'
											onClick={() => setCurrentTab('login')}
											style={{ "backgroundColor": (currentTab === "login") ? "#E7C673" : " rgba(55, 55, 55, 0)" }}>
											登入
										</button>
									</h6>
									<h6 className="signup-tab">
										<button
											type='button'
											onClick={() => setCurrentTab('signup')}
											style={{ "backgroundColor": (currentTab === "signup") ? "#E7C673" : "rgba(55, 55, 55, 0)" }}>
											註冊
										</button>
									</h6>
								</div>
								<div className="tabs-content">
									{currentTab === 'login' ? (
										<SingIn myModal={myModal} setIsLogin={setIsLogin} />
									) : (
										<SignUp myModal={myModal} setIsLogin={setIsLogin} />
									)
									}
								</div>
								{/* <button type="button" className="btn-close" data-bs-dismiss="modal"></button> */}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>)
}