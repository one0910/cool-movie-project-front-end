import React, { useContext, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { OrderContext } from '../../store';
import { authFetch, convertTimeFormat, convertPlayDateFormat } from '../../utilities';
import { Loading } from '../../components';
import { MovieDataType, GloabalThemeCSS, PopUpwindowRefType } from '../../interface';
import { Screens } from './components/Screens';
import styled, { ThemeContext } from 'styled-components';
import { MovieLevelColor } from '../../assets/GlobalStyle';
import { PopUpWindows } from '../../components';


const MovieTitleWrap = styled.div`
	.movieTitleInfo{
		span:nth-of-type(1){
      color:${props => props.theme.movieLevel};
      border:1px solid ${props => props.theme.movieLevel};
    }
	}
`

interface MovieInfoProps {

}



export const Movie: React.FC<MovieInfoProps> = ({ }) => {
	const [state, dispatch] = useContext(OrderContext);
	const { id, isRelease } = useParams()
	const { setTheme } = useContext<GloabalThemeCSS>(ThemeContext)
	const [movieInfo, setMovieInfo] = useState<MovieDataType | null>(null)
	const movieLevelRef = useRef<'普' | '護' | '輔' | '限'>('普');
	const movieLenghtRef = useRef<string | null>(null)
	const movieReleaseDateRef = useRef<{ date: string } | null>(null)
	const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
	const [movieDescrip, setMovieDescrip] = useState(false)
	const playerRef = useRef<any>(null)
	const [isScreen, setIsScreen] = useState(false)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate();

	useEffect(() => {
		if (state.orderList.screenId) {
			setIsScreen(true)
		}
		if (movieInfo?.screens) {
			setMovieDescrip(true)
		}
	}, [state.orderList.screenId, movieInfo?.screens])


	useEffect(() => {
		(async function () {
			setLoading(true)
			if (window.scrollY > 0) {
				window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
			}
			try {
				const response = await authFetch.get(`/api/movie/?isRelease=${isRelease}&id=${id}`)
				setMovieInfo(response.data.data.data)
				movieLevelRef.current = ['普', '護', '導', '限'][response.data.data.data.level] as '普' | '護' | '輔' | '限'
				movieLenghtRef.current = convertTimeFormat(response.data.data.data.time)
				movieReleaseDateRef.current = convertPlayDateFormat(response.data.data.data.releaseData)
				setTheme((currentTheme) => ({
					...currentTheme,
					movieLevel: MovieLevelColor[movieLevelRef.current],
					theaterSize: state.orderList.theater_size
				}))

				dispatch({
					type: "ADD_ORDER_FROM_HOME",
					payload: {
						movieId: id,
						movie_name: response.data.data.data.name,
						movie_length: convertTimeFormat(response.data.data.data.time),
						movie_level: ['普', '護', '導', '限'][response.data.data.data.level],
					},
				});

				setLoading(false)
			} catch (error) {
			}
		}())
	}, [])

	const openYoutubeVideo = () => {
		setLoading(true)
		popUpwindowRef.current?.openModal()
		const iframe = document.createElement('iframe');
		iframe.src = movieInfo?.videos[0] || "";
		iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
		iframe.allowFullscreen = true;
		playerRef.current?.appendChild(iframe);
		setTimeout(() => {
			setLoading(false)
		}, 500)
	}

	const closeModal = () => {
		popUpwindowRef.current?.closeModal()
		const iframe = playerRef.current?.querySelector('iframe');
		if (iframe) {
			playerRef.current?.removeChild(iframe);
		}
	}

	return (
		<div>
			<Loading isActive={loading} />
			<div className='movieBanner mb-3 mb-lg-0'>
				<div className='palyIcon' onClick={openYoutubeVideo}>
					<img src="/images/utilites/play.svg" alt="" />
				</div>
				<PopUpWindows ref={popUpwindowRef} backgroundClose={false} status={"youtube"}>
					<div className='trailMovie mt-5' ref={playerRef}>
						<i className="bi bi-x" onClick={closeModal} ></i>
					</div>
				</PopUpWindows>
				<picture>
					<img src={movieInfo?.videoImg} alt="" />
				</picture>
				<MovieTitleWrap className='movieTitle text-left text-nowrap'>
					<p className='color-primary'>熱映中 NOW SHOWING</p>
					<p className='fs-2 font-weight-bold'>{movieInfo?.name}</p>
					<div className='movieTitleInfo d-flex justify-content-start'>
						<span className='px-1 me-2'>{movieLevelRef.current}</span>
						<span className='border px-1'>{movieLenghtRef.current}</span>
					</div>
				</MovieTitleWrap>
			</div>
			<div className='container movieInfoWrap'>
				<div className="row">
					<div className="movieInfoPart col-xl-4 text-center">
						<img src={movieInfo?.imgs[0]} alt="" />
						<div className='movieDigesttWrap p-3'>
							<div className='d-flex justify-content-between mb-2'>
								<span>上映日期 :</span>
								<span>{movieReleaseDateRef.current?.date}</span>
							</div>
							<div className='d-flex justify-content-between mb-2'>
								<span>導演 :</span>
								<span>{movieInfo?.director}</span>
							</div>
							<div className='d-flex justify-content-between'>
								<span>演員 :</span>
								<span className='w-75 text-end'>{movieInfo?.actors}</span>
							</div>
						</div>
					</div>
					<div className="screenPart col-xl-8">
						<div className={`movieDescriptWrap mb-4 ${!movieDescrip && 'mh-100'}`}>
							<div className='descript mb-3'>
								<span>電影簡介</span>
							</div>
							<p>{movieInfo?.desc}</p>
						</div>
						<Screens screens={movieInfo?.screens} />
					</div>
				</div>
			</div>

			<div className={`movieCheckContainer ${!movieDescrip && 'd-none'}`}>
				<nav className="navbar bg-1st">
					<div className="container">
						<div className='row w-100'>
							<div className="col-2 text-end">
								<img src={movieInfo?.imgs[0]} className='movieImg' alt="" />
							</div>
							<div className="movieCheckName col-3 col-lg-1 d-flex align-items-center">
								<p className='m-0 text-truncate'>{movieInfo?.name}</p>
							</div>
							<div className="movieCheckScreen col-lg-4 col-4 d-flex flex-column justify-content-center align-items-start">
								<p className='m-0'>{state.orderList.movie_date}</p>
								<span>{state.orderList.theater_size} {state.orderList.movie_time}</span>
							</div>
							<div className="movieCheckNext col-lg col-3 d-flex justify-content-lg-end align-items-center">
								<button type='button' className='btn_primary' disabled={!isScreen} onClick={() => navigate("/ticknumber")}>下一步</button>
							</div>
						</div>
					</div>
				</nav>
			</div>
		</div>
	);
}