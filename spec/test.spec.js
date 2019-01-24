process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');
const seedDB = require('../db/seed');
const {
  muscles,
  users,
  exercises,
  workouts,
  completedWorkouts,
} = require('../db/testData/index');
const {
  musclesDocs,
  usersDocs,
  exercisesDocs,
  workoutDocs,
  completedWorkoutsDocs,
} = require('../db/seed');

const request = supertest(app);

describe('/api', () => {
  let musclesDocs;
  let usersDocs;
  let exercisesDocs;
  let workoutDocs;
  let completedWorkoutsDocs;
  beforeEach(() => seedDB({
    muscles,
    users,
    exercises,
    workouts,
    completedWorkouts,
  }).then((docs) => {
    console.log('seeded fresh database');
    musclesDocs = docs[0];
    usersDocs = docs[1];
    exercisesDocs = docs[2];
    workoutsDocs = docs[3];
    completedWorkoutsDocs = docs[4];
  }));
  it('returns 404 for a get request on a url that doesnt exist', () => request
    .get('/testing')
    .expect(404)
    .then((res) => {
      expect(res.body.msg).to.equal('Page Not Found');
    }));
  describe('/users', () => {
    it('GET - 200 and returns all users', () => request
      .get('/api/users')
      .expect(200)
      .then((res) => {
        expect(res.body.users).to.have.length(3);
        expect(res.body.users[0]).to.have.property('user_name');
      }));
    describe('/:username', () => {
      it('GET - 200 & returns specified user when provided with username', () => request
        .get('/api/users/charlie')
        .expect(200)
        .then((res) => {
          expect(res.body.user).to.have.property('user_name', 'charlie');
          expect(res.body.user.user_name).to.equal('charlie');
        }));
      it('returns 404 for a get request on wrong user', () => request
        .get('/api/users/wronguser')
        .expect(404)
        .then((res) => {
          expect(res.body.msg).to.equal('User not found');
        }));
      it(' POST - 201 & returns created user', () => {
        const newUser = {
          user_name: 'test user',
          password: 'test_password',
        };
        return request.post('/api/users')
          .send(newUser)
          .expect(201)
          .then((res) => {
            expect(res.body.user.user_name).to.equal('test user');
          });
      });
      it(' POST - 400 for an incomplete request', () => {
        const newUser = {
          user_name: '',
          password: 'test_password',
        };
        return request.post('/api/users')
          .send(newUser)
          .expect(400)
          .then((res) => {
            expect(res.body.msg).to.equal('Bad request');
          });
      });
      it('DELETE - 204 & successful deletion', () => request.delete('/api/users/charlie')
        .expect(204)
        .then((res) => {
          expect(res.status).to.equal(204);
        }));
      describe('/workouts', () => {
        it('GET - 200 & gets all workouts of the username', () => request
          .get('/api/users/charlie/workouts')
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.key('saved_workouts');
          }));
      });
      describe('/completed_workouts', () => {
        it('GET - 200 and all user completed workouts', () => {
          return request.get('/api/users/charlie/completed_workouts')
          .expect(200)
          .then((res) => {
            expect(res.body.userCompleted[0]).to.have.property('workout');
            expect(res.body.userCompleted).to.have.length(1);
          })
        });
      });
    });
  });
  describe('/workouts', () => {
    it('GET - 200 & gets all workouts', () => request
      .get('/api/workouts')
      .expect(200)
      .then((res) => {
        expect(res.body.workouts).to.have.length(4);
      }));
    it('POST - 201 and a confirmation message', () => {
      const workout = {
        created_by: `${usersDocs[0]._id}`,
        exercises: [`${usersDocs[0]._id}`, `${usersDocs[0]._id}`],
        private: true,
        name: 'new_workout',
      };
      return request
        .post('/api/workouts')
        .expect(201)
        .send(workout)
        .then((res) => {
          expect(res.body).to.have.keys('newWorkout');
        });
    });
    it('POST - 400 for an incomplete request', () => {
      const workout = {
        created_by: ``,
        exercises: [``, ``],
        private: true,
        name: 'new_workout',
      };
      return request
        .post('/api/workouts')
        .expect(400)
        .send(workout)
        .then((res) => {
          expect(res.body.msg).to.equal('Bad request');
        });
    })
    describe('/:workout_id', () => {
      it('GET - 200 & returns specified workout when provided with workout name', () => request
        .get('/api/workouts/workout%201')
        .expect(200)
        .then((res) => {
          expect(res.body.workout).to.have.property('created_by');
          expect(res.body.workout.name).to.equal('workout 1');
        }));
      it('DELETE 204 and responds with a delete successful message', () => request
        .delete('/api/workouts/workout%201')
        .expect(204)
        .then((res) => {
          expect(res.status).to.equal(204);
        }));
    });
  });
  describe('/muscles', () => {
    it('GET - 200 & returns an array of all muscles', () => request
      .get('/api/muscles')
      .expect(200)
      .then((res) => {
        expect(res.body.muscles).to.have.length(10);
      }));
    describe('/:muscle', () => {
      it('GET - 200 & returns the muscle name and description', () => request
        .get('/api/muscles/Chest')
        .expect(200)
        .then((res) => {
          expect(res.body.muscle[0].muscle_name).to.equal('Chest');
        }));
    });
  });
  describe('/exercises', () => {
    it('GET - 200 and returns all exercises', () => request
      .get('/api/exercises')
      .expect(200)
      .then((res) => {
        expect(res.body.exercises).to.have.length(10);
        expect(res.body.exercises[0]).to.have.property('major_muscle');
      }));
    it('POST - 201 and successfully adds an exercise to the database', () => {
      const newExercise = {
        title: 'Test-Exercise',
        major_muscle: `${usersDocs[0]._id}`,
        minor_muscles: [`${usersDocs[0]._id}`, `${usersDocs[0]._id}`],
        content: 'this is a test exercise',
        created_by: `${usersDocs[0]._id}`,
      };
      return request
        .post('/api/exercises')
        .expect(201)
        .send(newExercise)
        .then((res) => {
          expect(res.body.exercise.content).to.equal('this is a test exercise');
        });
    });
    describe('/exercises/:title', () => {
      it(' GET - 200 & returns the exercise when provided with the correct title', () => request
        .get('/api/exercises/Pull%20Up')
        .expect(200)
        .then((res) => {
          expect(res.body.exercise).to.have.property('title');
          expect(res.body.exercise.title).to.equal('Pull Up');
        }));
      it('DELETE - 204 and successful deletion', () => request
        .delete('/api/exercises/Pull%20Up')
        .expect(204)
        .then((res) => {
          expect(res.status).to.equal(204);
        }));
    });
  });
  after(() => mongoose.disconnect());
});
