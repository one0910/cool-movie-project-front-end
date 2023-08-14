import React, { useRef, useContext, useEffect, useState, Dispatch, SetStateAction } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../../utilities";
import { OrderContext } from "../../../store/";
import { OrderType } from "../../../store/";
import { ThemeContext } from "styled-components";
import { GloabalThemeCSS } from "../../../interface";
import { MovieLevelColor } from "../../../assets/GlobalStyle";
import { PopUpWindows, MessageBox } from "../../../components";
import { PopUpwindowRefType } from "../../../interface";
import { HomeScreenCheck } from "./HomeScreenCheck";
interface OrderFormProps { }

interface AvailableMoviesType {
  date: string,
  movie: string,
  movieId: string,
  screenId: [] | string,
  time: string,
  price: number,
  movieLength: string,
  movieLevel: string
}


export const HomeOrderForm: React.FC<OrderFormProps> = ({ }) => {
  const [state, dispatch] = useContext(OrderContext);
  const { setTheme } = useContext<GloabalThemeCSS>(ThemeContext)
  const { register, getValues, setValue, handleSubmit, control, formState: { errors } } = useForm<OrderType>();
  const [loading, setLoading] = useState(false)
  const popUpwindowRef = useRef<PopUpwindowRefType | null>(null);
  const screenDataRef = useRef<{ screenId: string, movieName: string, screenTime: string, }>({ screenId: "", movieName: "", screenTime: "" })
  const watchForm = useWatch({
    control,
    name: ['movie_name', 'movie_date', "movie_time"]
  });
  const [availableMovies, setAvailableMovies] = useState<AvailableMoviesType[]>([])
  const [moviePlayDate, setMoviePlayDate] = useState<AvailableMoviesType[]>([])
  const [moviePlayTime, setMoviePlayTime] = useState<AvailableMoviesType[]>([])
  const navigate = useNavigate();

  useEffect(() => {
    const userId = state.orderList.memberId ? state.orderList.memberId : null;
    const googleId = state.orderList.googleId ? state.orderList.googleId : null;
    const memberStatus = state.orderList.memberId ? "member" : "quick";
    const memberName = state.orderList.memberName ? state.orderList.memberName : "";

    /*一進首頁，先清空全域的電影級別顏色*/
    setTheme({ movieLevel: "", theaterSize: "" })

    /*一進首頁，先清空全store裡的資料*/
    dispatch({
      type: "CLEAR_ORDER",
      payload: {
        memberId: userId,
        googleId: googleId,
        status: memberStatus,
        memberName: memberName,
      },
    });

    /*一進入首頁，就先去向後端取得可以上訂票的所有電影*/
    (async function () {
      setLoading(true)
      try {
        const response = await authFetch.get(`/api/screens/moviePlay`)
        setAvailableMovies(response.data.data)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }())
  }, [dispatch, getValues().movie_date]);

  /*選擇電影 - 用screenId去後端取得上映日期*/
  useEffect(() => {
    if (getValues().movie_name) {
      const screenId = JSON.parse(getValues().movie_name).screenId;
      (async function () {
        try {
          let response = await authFetch.post(`api/screens/moviePlayDate`, {
            "screenId": screenId
          })
          setMoviePlayDate(response.data.data)
          setValue('movie_time', "")
          setValue('movie_date', "")
        } catch (error) {
          console.log('error', error);
        }
      }())
    }
  }, [getValues().movie_name]);

  /*選擇上映日期 - 用screenId去後端取得上映時間*/
  useEffect(() => {
    if (getValues().movie_date) {
      const screenId = JSON.parse(getValues().movie_date).screenId;
      (async function () {
        try {
          let response = await authFetch.post(`api/screens/moviePlayTime`, {
            "screenId": screenId
          })
          setMoviePlayTime(response.data.data)
        } catch (error) {
          console.log('error', error);
        }
      }())
    }
  }, [getValues().movie_date])
  const openScreenSeat = (data: OrderType) => {
    const movie = (JSON.parse(data.movie_name).movie_name).split(") ")
    const theater_size = movie[0].replace("(", "")
    const movie_name = movie[1]
    const movie_date = JSON.parse(data.movie_date).date
    const movie_time = JSON.parse(data.movie_time).movieTime
    screenDataRef.current =
    {
      screenId: `${JSON.parse(data.movie_time).screenId}`,
      movieName: `${movie_name} (${theater_size})`,
      screenTime: `${movie_date} ${movie_time}`,
    }
    popUpwindowRef.current?.openModal();
    setTheme((currentTheme) => ({
      ...currentTheme,
      theaterSize: theater_size,
    }))
  }

  /******************在此處處理提交表單***************************/
  const onSubmit = (data: OrderType) => {
    popUpwindowRef.current?.closeModal()
    const movie = (JSON.parse(data.movie_name).movie_name).split(") ")
    const theater_size = movie[0].replace("(", "")
    const movieId = JSON.parse(data.movie_time).movieId
    const movie_name = movie[1]
    const movie_date = JSON.parse(data.movie_date).date
    const movie_time = JSON.parse(data.movie_time).movieTime
    const movie_length = JSON.parse(data.movie_time).movieLength
    const movie_level = JSON.parse(data.movie_time).movieLevel as '普' | '護' | '輔' | '限'
    // 設定全域的CSS變數
    setTheme((currentTheme) => ({
      ...currentTheme,
      theaterSize: theater_size,
      movieLevel: MovieLevelColor[movie_level]
    }))

    const screenId = JSON.parse(data.movie_time).screenId
    const price = (state.orderList.status === "member") ? (JSON.parse(data.movie_time).price) - 50 : JSON.parse(data.movie_time).price

    dispatch({
      type: "ADD_ORDER_FROM_HOME",
      payload: {
        // ...data,
        screenId: screenId,
        movieId: movieId,
        movie_name: movie_name,
        movie_date: movie_date,
        movie_time: movie_time,
        movie_length: movie_length,
        movie_level: movie_level,
        theater_size: theater_size,
        price: price,
      },
    });
    navigate("/ticknumber");
  };
  return (
    <div className="homeOrderForm container mt-2 d-flex justify-content-center">
      <form className="d-flex align-items-center flex-column flex-md-row" onSubmit={handleSubmit(onSubmit)}>
        <div className="selectWrap">
          <select {...register("movie_name", {
            required: {
              value: true,
              message: '請選擇電影',
            }
          })}
            style={{ backgroundImage: 'url(/images/home/movie-icon.png)' }}
          >
            <option value="">選擇電影</option>
            {
              availableMovies?.map((availableMovie, index) => {
                return (
                  <option
                    key={index}
                    value={JSON.stringify({
                      movie_name: availableMovie.movie,
                      screenId: availableMovie.screenId
                    })}
                  >
                    {availableMovie.movie}
                  </option>
                )
              })
            }
          </select>
          {errors.movie_name && (
            <p className="errorMsg">{errors.movie_name.message}</p>
          )}
        </div>
        <div className="selectWrap">
          <select {...register("movie_date", {
            required: {
              value: true,
              message: '請選擇日期',
            }
          })}
            style={{ backgroundImage: 'url(/images/home/calender-icon.png)' }}
          >
            <option value="">選擇日期</option>
            {
              moviePlayDate?.map((date, index) => {
                return (
                  <option
                    key={index}
                    value={JSON.stringify({
                      date: date.date,
                      screenId: date.screenId,
                    })}
                  >
                    {date.date}
                  </option>
                )
              })
            }
          </select>
          {errors.movie_date && (
            <p className="errorMsg">{errors.movie_date.message}</p>
          )}
        </div>
        <div className="selectWrap">
          <select {...register("movie_time", {
            required: {
              value: true,
              message: '請選擇時間',
            }
          })}
            style={{ backgroundImage: 'url(/images/home/click-icon.png)' }}>
            <option value="">選擇場次</option>
            {
              moviePlayTime?.map((time, index) => {
                return (
                  <option
                    key={index}
                    value={JSON.stringify({
                      movieTime: time.time,
                      movieId: time.movieId,
                      screenId: time.screenId,
                      price: time.price,
                      movieLevel: time.movieLevel,
                      movieLength: time.movieLength
                    })}
                  >
                    {time.time}
                  </option>
                )
              })
            }
          </select>
          {errors.movie_time && (
            <p className="errorMsg">{errors.movie_time.message}</p>
          )}
        </div>
        <button type="submit" className="rounded">前往訂票</button>
        <button type="button" className="rounded" onClick={handleSubmit(openScreenSeat)} disabled={(getValues().movie_time) ? false : true} >座位查詢</button>
      </form>
      <PopUpWindows ref={popUpwindowRef} backgroundClose={true} status={"homeCheckSeat"}>
        <MessageBox>
          <HomeScreenCheck screenDataRef={screenDataRef.current} />
          <div className='d-flex justify-content-center'>
            <button type='button' className='btn_primary mt-4 me-2 w-25' onClick={() => {
              popUpwindowRef.current?.closeModal()
            }}>確定
            </button>
            <button type='button' className='btn_primary mt-4 ms-2 w-25' onClick={handleSubmit(onSubmit)}>前往訂票</button>
          </div>
        </MessageBox>
      </PopUpWindows >
    </div>
  );
};
