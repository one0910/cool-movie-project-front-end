import React, { MutableRefObject, useState, useRef, useEffect, useContext } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SeatList } from './components/SeatList';
import { OrderContext } from '../../store';
import { authFetch } from '../../utilities';
import { Loading, Login } from '../../components';
import { ScreenCheck } from '../../components/ScreenCheck';
import styled, { css } from 'styled-components';
import io, { Socket } from "socket.io-client";
import { filterSeat } from '../../utilities';
interface SeatsProps {
}

export interface SeatsType {
	seat_id: string,
	is_booked: boolean
}

const Screen = styled.div`
	ul{
		grid-template-columns: ${(props) => (props.theme.theaterSize == "豪華廳") ? "auto auto auto 2fr auto auto auto auto auto auto auto 2fr auto auto auto auto" : ""};
		width: ${(props) => (props.theme.theaterSize == "豪華廳") ? "78%" : ""};
		@media screen and (max-width: 768px){
			width: ${(props) => (props.theme.theaterSize == "豪華廳") ? "99%" : ""};
			li{
				width: ${(props) => (props.theme.theaterSize == "豪華廳") ? "12px" : ""};
				height: ${(props) => (props.theme.theaterSize == "豪華廳") ? "12px" : ""};
				font-size:0rem
			}
		}
	}
`
export const Seats: React.FC<SeatsProps> = ({ }) => {
	const [state, dispatch] = useContext(OrderContext);
	const [isLogin, setIsLogin] = useState(false);
	const [seatsReady, setSeatsReady] = useState(false);
	const socketIoRef = useRef<Socket>()
	const socketScreenId = useRef<string>("")
	const seatRef = useRef<HTMLUListElement>(null)
	const seatNumRef = useRef<number>(0)
	const seatIndexRef = useRef<number[]>([])
	const tickNumber = Number(useParams().tickNumber)
	const [seats, setSeats] = useState<SeatsType[]>([])
	const [loading, setLoading] = useState(false)
	const [selectSeat, setSelectSeat] = useState<string[]>([]);
	const screenId = state.orderList.screenId
	const navigate = useNavigate()
	const url = process.env.REACT_APP_REMOTE_URL || "http://localhost:3000"



	/*進入該頁時，先載入座位表*/
	useEffect(() => {
		socketIoRef.current = io(url, { transports: ['websocket'] });

		// 確認是否由checkpay page的上一頁進來，若是的話，先將之前已經劃位的位子清除掉
		if (state.lastPage == "/checkpay" && state.orderList.socketId) {
			socketIoRef?.current?.emit("leaveScreen", {
				socketId: state.orderList.socketId,
				screenId: state.orderList.screenId,
				leave: false
			});
		}

		(async function () {
			setLoading(true)
			try {
				let response = await authFetch.post(`api/screens/moviePlaySeats`, {
					"screenId": [screenId]
				})

				setSeats(response.data.data[0].seatsStatus);
				seatNumRef.current = response.data.data[0].seatsStatus.length
				setLoading(false)
				if (window.scrollY > 0) {
					window.scrollTo({ top: 0, behavior: 'auto' });
				}
			} catch (error) {
				console.log('error', error);
			}
		}());
	}, [])


	/*當一進入選位頁面時，監聽socket的頻道, 是否有其他使用者在劃位中 */
	useEffect(() => {

		(async function () {
			//先取得socketId
			socketIoRef?.current?.on("userIDChannel", (id: string) => {
				socketScreenId.current = id
				dispatch({
					type: "SET_SELECT_SEATS",
					payload: {
						socketId: id,
					},
				});
			})
			socketIoRef?.current?.emit("join_screen", screenId);
			socketIoRef?.current?.on('join_screen', async (data: string | number[]) => {
				let seatDataIndex = (data !== "訪客進來了") ? filterSeat(socketScreenId.current, data) : []
				if (seatRef.current) {
					seatDataIndex.map((i: number) => {
						const element = seatRef?.current?.childNodes[i] as HTMLElement
						if (element) {
							element.dataset.seatselect = "true";
							element.classList.add("addScreenStyle");
						}
					});
				}
			})
		}());
		// 使用seatsReady的狀態管理方式，來確保seat裡的Li DOM已渲染完成
	}, [seatsReady])

	// 監聽當位置點擊時, sokcet server回傳的的座位狀態
	useEffect(() => {
		socketIoRef?.current?.on("reurnSeatStatus", async (data: {
			screenId: string;
			[key: string]: number[] | string;
		}) => {
			// 先將所有的位置初始化
			if (seatRef.current) {
				for (let i = 0; i < seatRef.current.childNodes.length; i++) {
					const element = seatRef?.current?.childNodes[i] as HTMLElement
					if (element) {
						element.dataset.seatselect = "false";
						element.classList.remove("addScreenStyle");
					}
				}
			}

			// 再針對被選到的位置在畫面上的處理
			let filteredData = filterSeat(socketScreenId.current, data)
			filteredData.map((i: number) => {
				if (seatRef.current) {
					const element = seatRef?.current?.childNodes[i] as HTMLElement
					if (element) {
						element.dataset.seatselect = "true";
						element.classList.add("addScreenStyle");
					}
				}
			});

		})
	}, [])

	// 監聽其他使用者的訂票是否完成，若是完成，則改變劃位狀態
	useEffect(() => {
		socketIoRef?.current?.on("order", async (indexData: []) => {
			indexData.map((i: number) => {
				if (seatRef.current) {
					const element = seatRef?.current?.childNodes[i] as HTMLElement
					if (element) {
						element.dataset.seatselect = "order";
						element.classList.add("addScreenStyleOrder");
					}
				}
			});
		})
	}, [])



	/*隨時監控點選的座位表位子*/
	useEffect(() => {
		dispatch({
			type: "SET_SELECT_SEATS",
			payload: {
				seat_ordered: selectSeat,
				seat_orderedIndex: seatIndexRef.current
			},
		});
		socketIoRef?.current?.emit("seatStatus", { screenId: screenId, socketId: socketScreenId.current, seatIndex: seatIndexRef.current });
	}, [selectSeat])

	// 點擊座位
	const pickSeat = (seat_id: string, selectRef: MutableRefObject<boolean>, DomRef: MutableRefObject<HTMLLIElement | null>, index: number) => {
		setSelectSeat((prevData) => {
			// 選擇座位
			if (prevData.length < tickNumber && !prevData.includes(seat_id)) {
				selectRef.current = !(selectRef.current);
				seatIndexRef.current = [...seatIndexRef.current, index]
				return [...prevData, seat_id];
				// 取消原本的座位
			} else if (prevData.includes(seat_id)) {
				selectRef.current = !(selectRef.current)
				seatIndexRef.current = seatIndexRef.current.filter((indexValue) => {
					return indexValue !== index
				});
				return prevData.filter((seat) => seat !== seat_id);
			} else if (prevData.length >= tickNumber) {
				alert('劃位已超過夠買張數');
			}
			return prevData;
		})
	}
	// console.log(' seatIndexRef.current=> ', seatIndexRef.current)
	const goCheckPage = () => {
		const slectSeatNums = state.orderList.seat_ordered?.length as number
		if (state.orderList.quantity - slectSeatNums == 0) {
			navigate("/checkpay")
		} else {
			alert(`您還有${state.orderList.quantity - slectSeatNums}個位子未劃位`);
		}
	}

	let childWrapDiv = null
	if (state.orderList.status == "quick") {
		childWrapDiv = <>
			<div className='d-flex justify-content-between align-items-end'>
				<button type='button' className='btn_primary w-50 me-2 mt-3' onClick={goCheckPage}>直接前往付款</button>
				<Login setIsLogin={setIsLogin} LoingMsg={"加入會員"} LoginStatus={"signup"} variable={"fromseats"} />
			</div>
			<div className='text-end mt-1'>
				<small className='color-primary fst-italic'>現在加入會員立即享有全電影50元折扣</small>
			</div>
		</>
	} else {
		childWrapDiv =
			<button type='button' className='btn_primary w-100 mt-3' onClick={goCheckPage}>前往付款</button>
	}

	return (
		<div className='container mb-5'>
			<Loading isActive={loading} />
			<div className='row'>
				<Screen className="col-md-8 text-center">
					{/* <p>選擇座位為<span>{`${selectSeat}`}</span></p> */}
					<img src="/images/screen2.svg" className='screenImg' alt="" />
					<div className='salseStatus d-flex justify-content-center mb-3'>
						<div className='me-4'><span className='d-inline-block me-2 rounded-circle'></span><strong>空位</strong></div>
						<div className='me-4'><span className='d-inline-block me-2 rounded-circle'></span><strong>已選</strong></div>
						<div className='me-4'><span className='d-inline-block me-2 rounded-circle'></span><strong>已售</strong></div>
						<div className='me-4'><span className='d-inline-block me-2 rounded-circle'></span><strong>其他人選位中...</strong></div>
					</div>
					<ul className='theater' ref={seatRef}>
						{seats.map((seat, index) => {
							return (
								<SeatList setSeatsReady={setSeatsReady} seatNumRef={seatNumRef} key={seat.seat_id} {...seat} index={index} onClick={pickSeat} />
							)
						})}
					</ul>
				</Screen>
				<div className="col-md-4">
					<ScreenCheck>
						{childWrapDiv}
					</ScreenCheck>
				</div>
			</div>
		</div>
	);
}