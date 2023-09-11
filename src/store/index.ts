import { createContext, useReducer, Dispatch } from "react";
// import { OrderFormType } from "../pages/Home/components/HomeOrderForm";

// 定義我們的狀態型別
export interface OrderType {
  googleId?: string
  memberId: string | null
  memberName: string,
  memberMail: string,
  screenId: string
  movieId: string;
  socketId: string;
  movie_name: string;
  movie_date: string;
  movie_time: string;
  theater_size: string,
  movie_length: string,
  movie_level: string,
  quantity: number,
  price: number,
  seatRefSocket?: []
  seat_remain_number?: number
  seat_ordered?: []
  seat_orderedIndex?: [],
  status: "quick" | "member"
}

export interface OrderState {
  orderList: OrderType;
  total: number
  lastPage: string
}


// 定義操作型別
export interface OrderAction {
  type: string;
  payload?: any;
}

// 建立我們的 Context
export const OrderInitialState: OrderState = {
  orderList: {
    memberId: null,
    memberName: "",
    memberMail: "",
    movieId: "",
    screenId: "",
    socketId: "",
    movie_name: "",
    movie_date: "",
    movie_time: "",
    movie_length: "",
    movie_level: "",
    theater_size: "",
    price: 0,
    quantity: 1,
    status: "quick"
  },
  total: 0,
  lastPage: "",
}

export type OrderContextType = [OrderState, Dispatch<OrderAction>];

export const OrderContext = createContext<OrderContextType>([OrderInitialState, () => { }])

export function OrderReducer(state: OrderState, action: OrderAction) {
  // const orderList = [...state.orderList]
  // console.log('action.payload', action.payload)
  // console.log('{ ...state.orderList }', { ...state.orderList })

  switch (action.type) {
    case 'CLEAR_ORDER':
      return {
        ...state,
        orderList: { movie_name: "", movie_date: "", movie_time: "", movie_length: "", movie_level: "", theater_size: "", price: 0, quantity: 1, ...action.payload }
      };

    case 'ADD_ORDER_FROM_HOME':
      return {
        ...state,
        orderList: { ...state.orderList, ...action.payload },
      };
    case 'ADD_MEMBER_DATA':
      return {
        ...state,
        orderList: { ...state.orderList, ...action.payload },
      };
    case 'SET_TOTAL_PRICE':
      return {
        ...state,
        orderList: { ...state.orderList, quantity: action.payload.quantity },
        total: action.payload.total,
      };
    case 'SET_LAST_PAGE':
      return {
        ...state,
        orderList: { ...state.orderList },
        lastPage: action.payload.lastPage,
      };
    case 'SET_SELECT_SEATS':
      return {
        ...state,
        orderList: { ...state.orderList, ...action.payload },
      };
    default:
      return state;
  }
}