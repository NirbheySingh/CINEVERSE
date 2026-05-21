const PAYMENT_METHODS = {
  card: 'credit_card',
  apple: 'apple_pay',
  paypal: 'paypal',
};

export const normalizePaymentMethod = (method) =>
  PAYMENT_METHODS[method] || method || 'credit_card';

export const parseSeatSelection = (seats, pricePerSeat = 15) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return [];
  }

  return seats.map((seat) => {
    if (typeof seat === 'object' && seat.row != null) {
      return {
        row: String(seat.row).toUpperCase(),
        number: Number(seat.number),
        price: Number(seat.price) || pricePerSeat,
      };
    }

    const seatStr = String(seat).trim();
    const match = seatStr.match(/^([A-Za-z]+)(\d+)$/);
    if (match) {
      return {
        row: match[1].toUpperCase(),
        number: parseInt(match[2], 10),
        price: pricePerSeat,
      };
    }

    return { row: 'A', number: 1, price: pricePerSeat };
  });
};

export const generateTicketId = () =>
  `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
