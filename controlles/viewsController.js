const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Built template

  // 3) Render the template using data from 1

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    })
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'name photo',
      },
    });

  if (!tour) {
    return next(new AppError('There is no tour with that slug.', 404));
  }

  tour.reviews = (tour.reviews || []).filter((review) => review && review.user);
  tour.guides = tour.guides || [];

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
};

exports.getMyTours = catchAsync(async (req, res) => {
  // 1) find all bookings and populate their tours
  const bookings = await Booking.find({ user: req.user.id });

  // 2) use the tours populated by the booking query
  const tours = bookings.map((booking) => booking.tour).filter(Boolean);

  res.status(200).render('overview', {
    title: 'My Tours ',
    tours,
  });
});

exports.updateUserDate = catchAsync(async (req, res, next) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updateUser,
  });
});
