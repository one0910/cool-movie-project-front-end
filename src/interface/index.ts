import { Interface } from "readline";
import { Dispatch, SetStateAction } from "react";

export interface I_MEMBER {
	birthday: string;
	email?: string;
	nickName: string;
	phoneNumber: string;
	profilePic: string;
}

export interface I_FormData {
	nickName: string;
	email: string;
	phoneNumber: string;
	birthday: string;
	profilePic: string;
}

export interface CatchErrorMessage {
	code: string,
	message: string,
	response: {
		status: number
		data: {
			message: string
		}
	};
}

export interface I_ChangePassword {
	password: string;
	confirmPassword: string;
}

export interface MovieDataType {
	id: string,
	name: string,
	actors: string[],
	desc: string,
	director: string[],
	imgs: string[],
	level: number,
	releaseData: string,
	screens: any,
	time: number,
	videoImg: string,
	videos: string[]
}

export interface GloabalThemeCSS {
	setTheme: Dispatch<SetStateAction<{
		movieLevel: string,
		theaterSize?: string
	}>>
}

export interface PopUpwindowRefType {
	openModal: () => void,
	closeModal: () => void,
}

export interface CreditCardType {
	phoneNumber: string,
	email: string,
	bankCode: string,
	creditCardNumber1: string,
	creditCardNumber2: string,
	creditCardNumber3: string,
	creditCardNumber4: string,
	expirationMonth: string,
	expirationYear: string,
	securityNum: string,
}

export interface CompleteResDataType {
	MovieName: string,
	MoviePlayDate: string,
	MoviePlayTime: string,
	OrderId: string,
	OrderSeat: string,
}

export interface OrderDataType {
	id: string
	theater_size: string,
	movieId: string,
	movieName: string,
	movielevel: string,
	moviePlayDate: string,
	moviePlayTime: string,
	seatOrdered: [],
	price: number,
	quantity: number,
	total: number,
	payMethod: string
	createTime: string
}
