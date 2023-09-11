import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { GoogleLoginComplete } from "./components/GoogleLoginComplete";
import { CheckComplete } from "./pages/CheckPay/CheckComplete";
import { CheckFail } from "./pages/CheckPay/CheckFail";
import {
  Home,
  Member,
  Movie,
  Seats,
  Ticknumber, MemberInfo,
  CheckPay,
  MemberAccount,
  MemberBonus,
  MemberOrder,
  Benifet,
  AboutUs,
} from "./pages"

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/member",
    element: <Member />,
    children: [
      {
        path: "",
        element: <MemberInfo />,
      },
      {
        path: "account",
        element: <MemberAccount />,
      },
      {
        path: "bonus",
        element: <MemberBonus />,
      },
      {
        path: "order",
        element: <MemberOrder />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ]
  },
  {
    path: "/movie/:id/:isRelease",
    element: <Movie />,
  },
  {
    path: "/ticknumber",
    element: <Ticknumber />,
  },
  {
    path: "/benifet",
    element: <Benifet />,
  },
  {
    path: "/aboutus",
    element: <AboutUs />,
  },
  {
    path: "/chooseSeates/:tickNumber",
    element: <Seats />,
  },
  {
    path: "/checkpay",
    element: <CheckPay />,
  },
  {
    path: "/checkcomplete/:orderId",
    element: <CheckComplete />,
  },
  {
    path: "/checkfail",
    element: <CheckFail />,
  },
  {
    path: "/googleLogin/success",
    element: <GoogleLoginComplete />,
  },
  {
    path: "/googleLogin/error",
    element: <GoogleLoginComplete />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];

export default routes;