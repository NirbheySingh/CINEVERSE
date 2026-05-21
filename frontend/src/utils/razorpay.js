export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });

export const openRazorpayCheckout = ({ data, onSuccess, onDismiss, onError }) => {
  const options = {
    key: data.razorpayKeyId,
    amount: data.amount,
    currency: data.currency || 'INR',
    name: 'CineVerse',
    description: data.movieTitle
      ? `${data.movieTitle} — ${data.seats?.length || 1} ticket(s)`
      : 'Movie tickets',
    order_id: data.orderId,
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
    theme: { color: '#e50914' },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (res) => {
    onError?.(res.error?.description || 'Payment failed');
  });
  rzp.open();
};
