const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE_LOCAL;

mongoose.connect(DB).then(() => {
  console.log('DB connection succesful');
});

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// import data into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    const usersWithObjectIds = users.map((user) => ({
      ...user,
      _id: new mongoose.Types.ObjectId(user._id),
    }));

    await User.collection.insertMany(usersWithObjectIds);
    await Review.create(reviews);
    console.log('data successfuly loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// delete all data from db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data successfuly deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
