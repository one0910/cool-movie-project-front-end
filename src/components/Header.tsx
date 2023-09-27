import React, { useState, useEffect, useContext, MouseEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { OrderContext } from "../store";
import { Login, Logout, HamburgerMenu } from "./";
import { authFetch, logoutClear, getCookie } from "../utilities";

interface HeaderProps { }

export const Header: React.FC<HeaderProps> = ({ }) => {
  const [state, dispatch] = useContext(OrderContext);
  const [isLogin, setIsLogin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const memberName = state.orderList.memberName ? state.orderList.memberName : "";
  const token = localStorage.getItem("userToken") ? localStorage.getItem("userToken") : null;
  const navigate = useNavigate();

  // 當網頁重新整理refresh時，檢查是否已有登入過
  useEffect(() => {
    const rememberMe = getCookie("remember_me");
    if (token) {
      const tokenExpTime = JSON.parse(atob(token?.split(".")[1] || "")).exp;
      const userId = JSON.parse(atob(token?.split(".")[1] || "")).id;
      const currentTime = Math.floor(Date.now() / 1000);
      // 如果原本的token沒過期，則繼續向後端拿資料
      console.log(' tokenExpTime=> ', tokenExpTime)
      console.log(' currentTime=> ', currentTime)
      if (rememberMe && tokenExpTime > currentTime) {
        (async function () {
          try {
            let response = await authFetch.get("/api/member/getUser");
            const userName = response.data.data.nickName;
            const userMail = (response.data.data.email) ? response.data.data.email : null
            const googleId = (response.data.data.googleId) ? response.data.data.googleId : null
            dispatch({
              type: "ADD_MEMBER_DATA",
              payload: {
                memberId: userId,
                googleId: googleId,
                memberName: userName,
                memberMail: userMail,
                status: "member",
              },
            });
          } catch (error) {
            console.log("error", error);
          }
          setIsLogin(true);
        })();
      } else {
        logoutClear(dispatch);
        setIsLogin(false);
      }
    } else {
      logoutClear(dispatch);
      setIsLogin(false);
    }
  }, [dispatch]);
  return (
    <div className="headerContainer position-sticky left-0 top-0">
      <nav className="navbar container">
        <div className="container-fluid p-0 space-between">
          <a className="logo" onClick={() => window.location.href = '/'}>
            <img src="/images/Logo.png" alt="" />
          </a>
          <ul className="menuWrap">
            <NavLink to={`/benifet`}>
              <li>好康優惠</li>
            </NavLink>
            <NavLink to={`/aboutus`}>
              <li>關於影城</li>
            </NavLink>
          </ul>
          <div className="d-flex align-items-center">
            {(isLogin || state.orderList.status === "member") ? (
              <div className="loginNav">
                <NavLink className="nav-link navLink" to={`/member`}>
                  <i className=" bi-person-circle btn-outline-warning"></i>
                </NavLink>
                <span className="me-2 memberName">{memberName} 您好</span>
                <Logout isLogin={isLogin} setIsLogin={setIsLogin} />
              </div>
            ) : (
              <Login setIsLogin={setIsLogin} LoingMsg={"登入 / 註冊"} LoginStatus={"login"} />
            )}
            <div
              className="navbar-hamburger ms-2 d-block d-md-none"
              role="button"
              onClick={() => setIsOpen(true)}
            >
              <img src="/images/menu-hamburger.png" />
            </div>
          </div>
        </div>
      </nav>
      <HamburgerMenu
        isLogin={isLogin}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      ></HamburgerMenu>
    </div>
  );
};
