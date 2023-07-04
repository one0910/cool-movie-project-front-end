import React, { useContext, useEffect } from 'react'
import { OrderContext } from '../../../store'
import { useForm, useWatch } from "react-hook-form"
import { ThemeContext } from 'styled-components'
import { GloabalThemeCSS } from '../../../interface'

interface ScreensProps {
	screens: {
		date: string,
		screenType: {
			[key: string]: {
				time: string,
				screenId: string,
				price: number
			}[]
		}
	}[]
}


export const Screens: React.FC<ScreensProps> = (props) => {
	const [state, dispatch] = useContext(OrderContext);
	const { setTheme } = useContext<GloabalThemeCSS>(ThemeContext)
	const { screens } = props
	const { register, getValues, control, handleSubmit } = useForm();
	const watchForm = useWatch({ control });
	useEffect(() => {
		if (getValues().checked) {
			const { movie_date, movie_screenId, movie_size, movie_time, price } = JSON.parse(getValues().checked)
			dispatch({
				type: "ADD_ORDER_FROM_HOME",
				payload: {
					screenId: movie_screenId,
					movie_date: movie_date,
					movie_time: movie_time,
					theater_size: movie_size,
					price: price,
				},
			});

			// 設定全域的CSS變數
			setTheme((currentTheme) => ({
				...currentTheme,
				theaterSize: movie_size,
			}))
			// window.scrollTo({ top: (window.innerHeight) * 3, behavior: 'auto' });
		}
	}, [watchForm])
	return (
		<form className='screenFrom'>
			<div className='screenFromTitle mt-2 mb-3'>
				<span>線上訂票</span>
			</div>
			{(screens) ? screens?.map((screen, index) => {
				return (
					<div key={index}>
						<h2 className='fs-4'>{screen.date}</h2>
						{Object.keys(screen.screenType).map((type, index) => {
							return (
								<div key={index}>
									<p className='theaterSize mb-2'>{type}</p>
									<div className='screenTime ms-2 ms-lg-3'>
										{screen.screenType[type].map((item, index) => {
											return (
												<span key={index}>
													<input
														type="radio"
														id={item.screenId}
														value={JSON.stringify({
															movie_time: item.time,
															movie_screenId: item.screenId,
															movie_date: screen.date,
															movie_size: type,
															price: item.price
														})}
														{...register('checked')}
													/>
													<label htmlFor={item.screenId}>{item.time}</label>
												</span>
											)
										})}
									</div>
								</div>
							)
						})}
					</div>
				)
			}) : "即將開放訂票"}
			{ }
		</form>
	);
}