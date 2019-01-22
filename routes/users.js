const usersRouter = require('express').Router();

const { getAllUsers, getSingleUser, getWorkoutByUserId } = require('../controllers/users');

usersRouter.route('/')
  .get(getAllUsers);

usersRouter.route('/:username')
  .get(getSingleUser);

usersRouter.route('/:username/workouts')
  .get(getWorkoutByUserId);


module.exports = usersRouter;
