import React, { useState, useEffect, useContext, useRef } from "react";
import { OrderContext } from "../../store";
import { authFetch } from "../../utilities";
import { MemberContainer } from "../../components/MemberContainer";
import { OrderDataType, PopUpwindowRefType } from "../../interface";
import { Loading } from "../../components";
import { PopUpWindows } from "../../components";
import { OrderList } from "./components/OrderList";

export const MemberOrder: React.FC = ({ }) => {
  const [state, dispatch] = useContext(OrderContext);
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderDataType[]>([])


  useEffect(() => {
    (async function () {
      setLoading(true)
      try {
        let response = await authFetch.get(`api/order/getMemberOrder/?memberId=${state.orderList.memberId}`)
        setOrderData(response.data.data)
        setLoading(false)
      } catch (error) {
        console.log('error', error);
      }
    }())
  }, [])

  return (
    <>
      <MemberContainer title="訂票紀錄">
        <Loading isActive={loading} />
        <div className="memberOrder">
          <ul className="orderHead">
            <li>訂票時間</li>
            <li>電影</li>
            <li>放映場次</li>
            <li>座位</li>
          </ul>
          <ul className="orderContentWrap">
            {orderData.map((order, index) => {
              return (
                <OrderList key={order.id} {...order} />
              )
            })}
          </ul>
        </div>

      </MemberContainer>
    </>
  );
};
