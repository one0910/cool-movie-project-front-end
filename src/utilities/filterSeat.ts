export const filterSeat = (socketId: string, receivedata: any) => {
  let seatDataFiltered = { ...receivedata };
  delete seatDataFiltered[socketId];
  let finalSeatIndexData: number[] = [];
  for (let key in seatDataFiltered) {
    if (key !== 'screenId') {
      finalSeatIndexData = [...finalSeatIndexData, ...seatDataFiltered[key]];
    }
  }
  return finalSeatIndexData;
}