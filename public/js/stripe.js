import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51UJ2DXACZsockGb8sLlvviLN4B9IMv1vYH5lYPY77cuXyYshRMysIW3oqJXcRUejpc2YHXFnoJDmwYgdcbhB3pkM00YkWuXwut',
);

export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from the api
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) create checkout form + chanre credit cart
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
