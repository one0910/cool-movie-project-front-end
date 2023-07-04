import React, { useState, useEffect, MutableRefObject, Dispatch, SetStateAction, useContext } from 'react'
import { OrderContext } from '../store';
import { useForm, useWatch } from "react-hook-form"
import { authFetch, getCookie } from '../utilities';
import { Loading, ErrorMsg } from './';
import { CatchErrorMessage } from '../interface';


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

	const loginForm = (data: SignInType) => {
		(async function () {
			try {
				setloading(true)
				const response = await authFetch.post('/api/member/signin', {
					email: data.useremail,
					password: data.password
				})
				const userToken = response.data.data.token
				const userId = response.data.data.signinRes._id
				const userName = response.data.data.signinRes.nickName
				const quantity = (state.orderList.quantity) ? state.orderList.quantity : 1
				const price = (state.orderList.price > 0) ? (state.orderList.price) - 50 : state.orderList.price
				localStorage.setItem('userToken', userToken)

				// 監控若是有勾選"保持登入"
				if (getValues().remember_me) {
					document.cookie = "remember_me=true; SameSite=None; Secure";
				} else {
					document.cookie = "remember_me=; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 UTC";
				}
				// 登入後，將會員名稱、會員ID、會員狀態、價格重新寫入store
				dispatch({
					type: "ADD_MEMBER_DATA",
					payload: {
						memberId: userId,
						memberName: userName,
						price: price,
						status: "member"
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

			} catch (error) {
				setloading(false)
				const CatchErrorMessage = error as CatchErrorMessage
				if (CatchErrorMessage.code === "ERR_NETWORK") {
					setErrMsg('無法連線至伺服器，請聯絡伺服器管理員或是檢查您的網路')
				}

				console.log('CatchErrorMessage.code', CatchErrorMessage.code)
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

	return (
		<>
			<Loading isActive={loading} />
			<div id="login-tab-content">
				<form className="login-form" onSubmit={handleSubmit(loginForm)}>
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
					<button type="submit" className="button">登入</button >
				</form>
				<div className="help-text">
				</div>
				<ErrorMsg>{errMsg}</ErrorMsg>
			</div>
		</>
	);
}