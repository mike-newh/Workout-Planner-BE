const Workouts = require('../models/Workout');


exports.getAllWorkouts = (req, res, next) => {
  Workouts.find()
    .then((workouts) => {
      if (!workouts.length) return Promise.reject({ status: 404, msg: 'workouts not found'});
      res.status(200).send({ workouts });
    })
    .catch(next);
};

exports.getSingleWorkout = (req, res, next) => {
  Workouts.find({ name: req.params.workout_name })
    .then((workout) => {
      if (!workout) return Promise.reject({ status: 404, msg: 'workout not found'});
      [ workout ] = workout;
      res.status(200).send({ workout });
    })
    .catch(next);
};

exports.postNewWorkout = (req, res, next) => {
  Workouts.create({
    name: req.body.name,
    exercises: req.body.exercises,
    private: req.body.private,
    created_by: req.body.created_by,
  })
    .then((newWorkout) => {
      res.status(201).send({ newWorkout });
    })
    .catch(next);
}



exports.deleteWorkout = (req, res, next) => {
  Workouts.remove({ name: req.params.workout_name })
    .then(() => {
      return res.status(204).send({ msg: 'Successful deletion'});
    })
    .catch(next);
};
