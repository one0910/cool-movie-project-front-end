/* eslint-disable @typescript-eslint/no-empty-interface */
import React, { useRef, useContext, useEffect, useState } from 'react'
import { OrderContext } from '../../store';
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { CallToActio } from './components/CallToActio';
import { ScreenCheck } from '../../components/ScreenCheck';
import io, { Socket } from "socket.io-client";
interface OrderFastProps { }

interface TicketType {
	normal_ticket_num: number
}

export const Ticknumber: React.FC<OrderFastProps> = ({ }) => {
	const [state, dispatch] = useContext(OrderContext);
	const { register, handleSubmit, control, getValues } = useForm<TicketType>();
	const [totalPrice, setTotalPrice] = useState(0)
	const [islogin, setIsLogin] = useState(false)
	const socketIoRef = useRef<Socket>()
	// const price = (state.orderList.price > 0) ? (state.orderList.price) - 50 : state.orderList.price
	const navigate = useNavigate()
	const price = state.orderList.price
	const watchForm = useWatch({ control, name: ['normal_ticket_num'] });
	const url = process.env.REACT_APP_REMOTE_URL || "http://localhost:3000"

	useEffect(() => {
		socketIoRef.current = io(url, { transports: ['websocket'] });

		// 若是由選位頁的上一頁進來，則先清除socket裡剛已有選位的位子
		if (state.orderList.socketId) {
			socketIoRef?.current?.emit("leaveScreen", {
				socketId: state.orderList.socketId,
				screenId: state.orderList.screenId,
				leave: true
			});
		}
	}, [])
	// 隨時監控是否為登入狀態
	useEffect(() => {
		if (state.orderList.status === "member") {
			setIsLogin(true)
		} else {
			setIsLogin(false)
		}
	}, [state.orderList.status])

	// 隨時監控總費用 - 1.select裡的張數變動時、2.當登入或註冊時，oreder裡的price會變動
	useEffect(() => {
		const totalPrice = (state.orderList.price) * (getValues().normal_ticket_num)
		setTotalPrice(totalPrice)
		dispatch({
			type: "SET_TOTAL_PRICE",
			payload: {
				quantity: Number(getValues().normal_ticket_num),
				total: totalPrice,
			},
		});
	}, [getValues().normal_ticket_num, state.orderList.price])

	const goSelectSeats = () => {
		navigate(`/chooseSeates/${state.orderList.quantity}`);
	}
	return (
		<div className="container mb-5">
			<div className="row gx-5">
				<div className="col-xl-8">
					<p className='mt-4'>選擇您希望購買的電影票張數和類型, 每筆交易最多可購買10張電影票</p>
					<CallToActio isLogin={islogin} setIsLogin={setIsLogin} />
					<div className='ticketGenre'>
						<div className='mb-2'>
							<img src="/images/home/ticket-icon.png" className='iconImg' alt="" />
							<span className='ms-3 color-primary fw-bold'>一般票種</span>
						</div>
						<div className=" bg-2nd p-1 p-lg-3 rounded-1 table-responsive">
							<table className='table text-color table-borderless m-0'>
								<thead>
									<tr>
										<th scope="col">票種</th>
										<th scope="col">單價</th>
										<th scope="col">數量</th>
										<th scope="col" className='text-end'>小計</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{(islogin) ? "會員價" : "一般票價(非會員)"}</td>
										<td>${price}</td>
										<td>
											<select
												{...register("normal_ticket_num")}
												id="selectNumber">
												{[...Array(10)].map((__, index) => {
													return (
														<option value={index + 1} key={index}>{index + 1}張</option>
													)
												})}
											</select>
										</td>
										<td className='text-end'>${totalPrice}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div className="col-xl-4">
					<ScreenCheck >
						<button type='button' className='btn_primary w-100 mt-4' onClick={goSelectSeats}>前往劃位</button>
					</ScreenCheck>
				</div>
			</div>
		</div>
	);
}