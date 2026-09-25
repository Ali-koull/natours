const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controlles/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// start express app
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global MIDDLEWARES
// Set security HTTP headers
// Serving static files
app.set('query parser', 'extended');
app.use(express.static(path.join(__dirname, 'public')));

// security HTTP headers

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: [
//           "'self'",
//           'https://cdn.jsdelivr.net', // axios
//           'https://api.mapbox.com',
//           'https://js.stripe.com', // mapbox
//           "'unsafe-inline'", // لو عندك سكربتات inline بالـ pug
//         ],
//         frameSrc: [
//           "'self'",
//           'https://js.stripe.com',
//           'https://hooks.stripe.com',
//         ],
//         styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
//         fontSrc: ["'self'", 'https://fonts.gstatic.com'],
//         imgSrc: ["'self'", 'data:', 'blob:'],
//         connectSrc: [
//           "'self'",
//           'https://api.mapbox.com',
//           'https://cdn.jsdelivr.net',
//           'ws:',
//           'wss:',
//         ],
//       },
//     },
//   }),
// );
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (this express version does not work with xss)

// Prevent parameters pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.use((req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
