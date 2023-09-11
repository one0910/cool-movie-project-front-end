import React, { useState, useContext, useEffect, MutableRefObject, Dispatch, SetStateAction } from 'react'
import { OrderContext } from '../store'
import { useForm, useWatch } from "react-hook-form"
import { authFetch } from '../utilities';
import { SignInType } from './';
import { Loading, ErrorMsg } from './';
import { CatchErrorMessage } from '../interface';
import { AxiosResponse } from 'axios';

interface SignUpPropsType {
	myModal: MutableRefObject<bootstrap.Modal | null>
	setIsLogin: Dispatch<SetStateAction<boolean>>
}

interface SingUpType extends SignInType {
	username: string
}

export const SignUp: React.FC<SignUpPropsType> = ({ myModal, setIsLogin }) => {
	const [state, dispatch] = useContext(OrderContext);
	const [errMsg, setErrMsg] = useState<string>()
	const [loading, setloading] = useState(false)
	const [emailAvailable, setEmailAvailable] = useState(null);
	const { register, handleSubmit, getValues, control, setError, formState: { errors } } = useForm<SingUpType>();
	const watchForm = useWatch({ control });


	/*******************即時偵測email是否重覆*****************/
	useEffect(() => {
		if (getValues().useremail !== "") {
			const timer = setTimeout(() => {
				(async function () {
					try {
						const response = await authFetch.post('/api/member/checkEmail', {
							email: getValues().useremail
						})
						if (response.status == 200) {
							setEmailAvailable(response.data.data.message)
						}
					} catch (error) {
						setEmailAvailable(null)
						const CatchErrorMessage = error as CatchErrorMessage
						const errorMessage = CatchErrorMessage.response.data?.message;
						setError("useremail", {
							type: "serverError",
							message: errorMessage
						});
					}
				}())
			}, 1000);
			return () => clearTimeout(timer)
		}
	}, [watchForm]);


	/******************登入後，將後傳回來的資料做處理*******************/
	const setDataUI = (response: AxiosResponse<any, any>) => {
		console.log(' response=> ', response)
		const userToken = response.data.data.token
		const userId = response.data.data.signinRes._id
		const userName = response.data.data.signinRes.nickName
		const userMail = response.data.data.signinRes.email
		const quantity = (state.orderList.quantity) ? state.orderList.quantity : 1
		const price = (state.orderList.price > 0) ? (state.orderList.price) - 50 : state.orderList.price
		const googleId = (response.data.data.signinRes.googleId) ? response.data.data.signinRes.googleId : ""
		localStorage.setItem('userToken', userToken)
		document.cookie = "remember_me=true; path=/; SameSite=None; Secure";
		// 註冊後，將會員名稱、會員ID、會員狀態、價格重新寫入store
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
		// 註冊後，總價重新寫入store
		dispatch({
			type: "SET_TOTAL_PRICE",
			payload: {
				quantity: quantity,
				total: (state.orderList.quantity) * (price),
			},
		});


		myModal.current?.hide();
		document.querySelector(".modal-backdrop")?.remove();
		setloading(false)
		setIsLogin(true)
	}

	/***********************表單寄送**************************/
	const signUpForm = (data: SingUpType) => {
		(async function () {
			setloading(true)
			try {
				const response = await authFetch.post('/api/member/signup', {
					nickName: data.username,
					email: data.useremail,
					password: data.password
				})
				// const userToken = response.data.data.token
				// const userId = response.data.data.createRes._id
				// const userName = response.data.data.createRes.nickName
				// const quantity = (state.orderList.quantity) ? state.orderList.quantity : 1
				// const price = (state.orderList.price > 0) ? (state.orderList.price) - 50 : state.orderList.price
				// localStorage.setItem('userToken', userToken)
				// document.cookie = "remember_me=true; SameSite=None; Secure";
				// // 註冊後，將會員名稱、會員ID、會員狀態、價格重新寫入store
				// dispatch({
				// 	type: "ADD_MEMBER_DATA",
				// 	payload: {
				// 		memberId: userId,
				// 		memberName: userName,
				// 		price: price,
				// 		status: "member"
				// 	}
				// })
				// // 註冊後，總價重新寫入store
				// dispatch({
				// 	type: "SET_TOTAL_PRICE",
				// 	payload: {
				// 		quantity: quantity,
				// 		total: (state.orderList.quantity) * (price),
				// 	},
				// });

				// myModal.current?.hide();
				// document.querySelector(".modal-backdrop")?.remove();
				// setloading(false)
				// setIsLogin(true)
				setDataUI(response)
			} catch (error) {
				setloading(false)
				const CatchErrorMessage = error as CatchErrorMessage
				setError("password", {
					type: "serverError",
					message: CatchErrorMessage.response.data?.message,
				});
				if (CatchErrorMessage.code === "ERR_NETWORK") {
					setErrMsg('無法連線至伺服器，請聯絡伺服器管理員或是檢查您的網路')
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

	let messageDiv = null;
	let classname = null;

	if (emailAvailable) {
		messageDiv = <div className="valid-feedback">{emailAvailable}</div>
		classname = `input is-valid`
	} else if (!emailAvailable && getValues().useremail !== undefined && getValues().useremail !== "") {
		classname = `input is-invalid`
		messageDiv = <div className="invalid-feedback">{errors?.useremail?.message}</div>
	} else if (errors.useremail) {
		classname = `input is-invalid`
		messageDiv = <div className="invalid-feedback">{errors?.useremail?.message}</div>
	} else {
		classname = `input`
	}

	return (
		<>
			<Loading isActive={loading} />
			<div id="signup-tab-content">
				<form className="signup-form" onSubmit={handleSubmit(signUpForm)}>
					<button type="button" className="button mt-3" onClick={openGoogleLogin} style={{ "letterSpacing": "1px" }}>
						<i className="bi bi-google me-1"></i>
						使用Google帳號登入
					</button >
					<div className='d-flex cross-line my-2'><span>或</span></div>
					<input
						type="text"
						className={`input ${errors.username && 'is-invalid'}`}
						id="user_name"
						autoComplete="off"
						placeholder="Username"
						{...register("username", {
							required: {
								value: true,
								message: '請輸入您的名稱',
							},
						})}
					/>
					{errors.username && (
						<div className="invalid-feedback">{errors?.username?.message}</div>
					)}
					<input
						type="email"
						className={classname}
						id="user_email"
						autoComplete="off"
						placeholder="Email"
						{...register("useremail", {
							required: {
								value: true,
								message: '請輸入您要設定的email',
							},
						})}
					/>
					{messageDiv}
					<input
						type="password"
						className={`input ${errors.password && 'is-invalid'}`}
						id="user_pass"
						autoComplete="off"
						placeholder="Password"
						{...register("password", {
							required: {
								value: true,
								message: '請輸入您要設定的密碼',
							},
							pattern: {
								value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
								message: '請輸入英文+數字至少8碼的密碼',
							},
							minLength: {
								value: 8,
								message: '請輸入英文+數字至少8碼的密碼',
							}
						})}
					/>
					{errors.password && (
						<div className="invalid-feedback">{errors?.password?.message}</div>
					)}
					{/* {signupBtn} */}
					<button type="submit" className="button" disabled={!emailAvailable}>註冊</button >
				</form>
				<div className="help-text">
				</div>
				<ErrorMsg>{errMsg}</ErrorMsg>
			</div>
		</>
	);
}