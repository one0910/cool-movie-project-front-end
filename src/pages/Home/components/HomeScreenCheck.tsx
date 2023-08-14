import React, { useState, useEffect } from 'react'
import styled from 'styled-components';
import { SeatsType } from '../../Seats';
import { authFetch } from '../../../utilities';
import { SeatList } from '../../Seats/components/SeatList';
import { Loading } from '../../../components';
interface HomeScreenCheckProps {
	screenDataRef?: {
		screenId: string,
		movieName: string,
		screenTime: string,
	}
}


const Screen = styled.div`
	ul{
		grid-template-columns: ${(props) => (props.theme.theaterSize == "豪華廳") ? "auto auto auto 2fr auto auto auto auto auto auto auto 2fr auto auto auto auto" : ""};
		width: ${(props) => (props.theme.theaterSize == "豪華廳") ? "90%" : "60%"};
		@media screen and (max-width: 768px){
			width: ${(props) => (props.theme.theaterSize == "豪華廳") ? "99%" : "93%"};
			li{
				width: ${(props) => (props.theme.theaterSize == "豪華廳") ? "12px" : ""};
				height: ${(props) => (props.theme.theaterSize == "豪華廳") ? "12px" : ""};
				font-size:0rem
			}
		}
	}
`

export const HomeScreenCheck: React.FC<HomeScreenCheckProps> = ({ screenDataRef }) => {
	const [isLogin, setIsLogin] = useState(false);
	const [seats, setSeats] = useState<SeatsType[]>([])
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		(async function () {
			setLoading(true)
			try {
				if (screenDataRef?.screenId) {
					let response = await authFetch.post(`api/screens/moviePlaySeats`, {
						"screenId": [screenDataRef?.screenId]
					})
					setSeats(response.data.data[0].seatsStatus);
					setLoading(false)
				}

			} catch (error) {
				console.log('error', error);
			}
		}());
	}, [screenDataRef?.screenId])
	return (
		<Screen className='text-center'>
			<Loading isActive={loading} />
			<img src="/images/screen2.svg" className='screenImg' alt="" />
			<div className='salseStatus d-flex justify-content-center align-items-center mb-3'>
				<div className='d-flex flex-column-reverse align-items-start me-4 bg-2nd rounded-2 text-color p-2' style={{ fontSize: '.8rem' }}>
					<p className='m-0'>{screenDataRef?.screenTime}</p>
					<p className='mb-1'>{screenDataRef?.movieName}</p>
				</div>
				<div className='me-2 me-lg-4'><span className='d-inline-block me-2 rounded-circle' style={{ background: "rgba(185, 182, 182, 0.24)" }}></span><strong>空位</strong></div>
				<div className='me-2 me-lg-4'><span className='d-inline-block me-2 rounded-circle' style={{ background: "rgb(72, 0, 0)" }}></span><strong>已售</strong></div>
			</div>
			<ul className='theater'>
				{seats.map((seat, index) => {
					return (
						<SeatList key={seat.seat_id} {...seat} index={index} />
					)
				})}
			</ul>
		</Screen>
	)
}