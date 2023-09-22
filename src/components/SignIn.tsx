import React, { useState, useEffect, MutableRefObject, Dispatch, SetStateAction, useContext } from 'react'
import { OrderContext } from '../store';
import { useForm, useWatch } from "react-hook-form"
import { authFetch, getCookie } from '../utilities';
import axios from 'axios';
import { Loading, ErrorMsg } from './';
import { CatchErrorMessage } from '../interface';
import { AxiosResponse } from 'axios';


interface LoginPropsType {
	myModal: MutableRefObject<bootstrap.Modal | null>
	setIsLogin: Dispatch<SetStateAction<boolean>>
}

export interface SignInType {
	normal_ticket_num: any;
	useremail: string,
	password: string
	remember_me: boolean
}


export const SingIn: React.FC<LoginPropsType> = ({ myModal, setIsLogin }) => {
	const [state, dispatch] = useContext(OrderContext);
	const [errMsg, setErrMsg] = useState<string>()
	const [loading, setloading] = useState(false)
	const { register, handleSubmit, control, getValues, setError, formState: { errors } } = useForm<SignInType>({
		defaultValues: {
			remember_me: true
		}
	});
	const watchForm = useWatch({ control });

	/******************登入後，將後傳回來的資料做處理*******************/
	const setDataUI = (response: AxiosResponse<any, any>) => {
		const userToken = response.data.data.token
		const userId = response.data.data.signinRes._id
		const userMail = response.data.data.signinRes.email
		const userName = response.data.data.signinRes.nickName
		const quantity = (state.orderList.quantity) ? state.orderList.quantity : 1
		const price = (state.orderList.price > 0) ? (state.orderList.price) - 50 : state.orderList.price
		const googleId = (response.data.data.signinRes.googleId) ? response.data.data.signinRes.googleId : ""
		localStorage.setItem('userToken', userToken)

		// 監控若是有勾選"保持登入"
		if (getValues().remember_me) {
			document.cookie = "remember_me=true; path=/; SameSite=None; Secure";
		} else {
			document.cookie = "remember_me=; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
		}

		// 登入後，將會員名稱、會員ID、會員狀態、價格重新寫入store
		dispatch({
			type: "ADD_MEMBER_DATA",
			payload: {
				memberId: userId,
				memberName: userName,
				memberMail: userMail,
				price: price,
				status: "member",
				googleId: googleId
			}
		})

		// 登入後，總價重新寫入store
		dispatch({
			type: "SET_TOTAL_PRICE",
			payload: {
				quantity: quantity,
				total: quantity * price,
			},
		});
		myModal.current?.hide();
		setloading(false)
		setIsLogin(true)
	}
	const loginForm = (data: SignInType) => {
		(async function () {
			try {
				setloading(true)
				const response = await authFetch.post('/api/member/signin', {
					email: data.useremail,
					password: data.password
				})
				setDataUI(response)
			} catch (error) {
				setloading(false)
				const CatchErrorMessage = error as CatchErrorMessage
				if (CatchErrorMessage.code === "ERR_NETWORK") {
					setErrMsg('無法連線至伺服器，請聯絡伺服器管理員或是檢查您的網路')
				}

				if (CatchErrorMessage.response.status === 404) {
					const errorMessage = CatchErrorMessage.response.data?.message;
					if (errorMessage.includes('帳號不存在')) {
						setError("useremail", {
							type: "serverError",
							message: errorMessage
						});

					} else if (errorMessage.includes('密碼錯誤')) {
						setError("password", {
							type: "serverError",
							message: errorMessage,
						});
					}
				}
			}
		}())
	}
	/*******************當按下google註冊時的按鈕*********************/
	const openGoogleLogin = () => {
		let timer: NodeJS.Timeout | null = null;
		const googleLoginURL = `${process.env.REACT_APP_REMOTE_URL}/api/google/login`;
		const newWindow = window.open(
			googleLoginURL,
			"_blank",
			"width=500,height=600"
		)
		if (newWindow) {
			timer = setInterval(() => {
				if (newWindow.closed) {
					(async function () {
						try {
							// let response = await axios.get(`${process.env.REACT_APP_REMOTE_URL}/api/google/login/success`, { withCredentials: true })
							let response = await authFetch.get('/api/google/login/success', { withCredentials: true })
							setDataUI(response)
						} catch (error) {
							console.log('error', error);
						}
					}())
					myModal.current?.hide();
					if (timer) clearInterval(timer);
				}
			}, 500);
		}
	}
	return (
		<>
			<Loading isActive={loading} />
			<div id="login-tab-content">
				<form className="login-form" onSubmit={handleSubmit(loginForm)}>
					<button type="button" className="button mt-3" onClick={openGoogleLogin} style={{ "letterSpacing": "1px" }}>
						<i className="bi bi-google me-1"></i>
						使用Google帳號登入
					</button >
					<div className='d-flex cross-line my-2'><span>或</span></div>
					<input
						type="text"
						className={`input ${errors.useremail && 'is-invalid'}`}
						id="user_login"
						autoComplete="off"
						placeholder="Email"
						{...register("useremail", {
							required: {
								value: true,
								message: '請輸入您的email',
							},
							pattern: {
								value: /^\S+@\S+$/i,
								message: '您的email格式不正確',
							},
						})}
					/>
					{errors.useremail && (
						<div className="invalid-feedback">{errors?.useremail?.message}</div>
					)}
					<input
						type="password"
						className={`input ${errors.password && 'is-invalid'}`}
						id="user_pass"
						autoComplete="off"
						placeholder="Password"
						{...register("password", {
							required: {
								value: true,
								message: '請輸入密碼',
							},
						})}
					/>
					{errors.password && (
						<div className="invalid-feedback">{errors?.password?.message}</div>
					)}
					<input
						type="checkbox"
						className="checkbox"
						id="remember_me"
						{...register("remember_me")}
					/>
					<label htmlFor="remember_me" className='remember_me'>保持登入</label>
					<button type="submit" className="button">電子郵件登入</button >
				</form>
				<div className="help-text">
				</div>
				<ErrorMsg>{errMsg}</ErrorMsg>
			</div>
		</>
	);
}