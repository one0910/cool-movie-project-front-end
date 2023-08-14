import React, { Dispatch, useEffect, MutableRefObject, RefObject, useRef, useState } from 'react'
import styled from 'styled-components'
import { SeatsType } from '../index'




interface SeatStatusType {
	seatStatus: boolean,
	setRef: boolean,
}

const Li = styled.li<SeatStatusType>`
	background-color: ${(props: any) => {
		if (props.seatStatus) {
			return "rgb(72, 0, 0);"
		} else if (!props.setRef) {
			return "rgba(185, 182, 182, 0.24)"
		}
		else {
			return "#E7C673"
		}
	}};
	color:${(props) => (props.setRef) ? "#000" : "rgba(255, 255, 255, 0.9)"};
`


interface SeatListProps extends SeatsType {
	index: number
	seatNumRef?: MutableRefObject<number>
	setSeatsReady?: Dispatch<React.SetStateAction<boolean>>

	onClick?: (
		seat_id: string,
		selectRef: MutableRefObject<boolean>,
		DomRef: MutableRefObject<HTMLLIElement | null>,
		index: number
	) => void
}

export const SeatList: React.FC<SeatListProps> = ({ setSeatsReady, seatNumRef, seat_id, is_booked, onClick, index }) => {
	const selectRef = useRef(false)
	const DomRef = useRef<HTMLLIElement | null>(null)
	// console.log(' index=> ', index)
	// console.log(' seatNumRef=> ', seatNumRef)
	useEffect(() => {
		if (seatNumRef && index === seatNumRef.current - 1) {
			setSeatsReady?.(true)
		}
	}, [])

	const clickHandler = (event: React.MouseEvent<HTMLLIElement, globalThis.MouseEvent>) => {
		// if (DomRef.current) { DomRef.current.style.color = "blue" }
		if (DomRef.current?.dataset.seatselect === "true") {
			alert("該座位目前已被其他使用者劃位中")
		}
		else if (DomRef.current?.dataset.seatselect === "order") {
			alert("該座位剛剛已被訂位")
		}
		else if (is_booked === false) {
			onClick?.(seat_id, selectRef, DomRef, index)
		}
		else {
			alert("該座位已被訂位")
		}
	}
	return (
		<Li
			seatStatus={is_booked}
			onClick={clickHandler}
			setRef={selectRef.current}
			ref={DomRef}
			data-seatselect={false}

		>
			{seat_id}
		</Li>

	);
}