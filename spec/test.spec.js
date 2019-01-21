const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('/api', () => {
  describe('/exercises/:exercise_id', () => {
    it(' GET - 200 & returns the exercise when provided with the correct id', () => request.get('/api/exercises/pull-up')
      .expect(200)
      .then((res) => {
        expect(res.body.exerciseData).to.have.property('exercise_name');
        expect(res.body.exerciseData.exercise_name).to.equal('pull up');
      }));
  });
  describe('/users/:username', () => {
    it('GET - 200 & returns specified user when provided with username', () => {
      return request.get('/api/users/charlie')
        .expect(200)
        .then((res) => {
          expect(res.body.userData).to.have.property('username', 'charli');
          expect(res.body.userData.name).to.equal('charlie');
        });
    });
  });
  describe('/workouts/:workout_name', () => {
    it('GET - 200 & returns specified workout when provided with workout name', () => {
      return request.get('/api/workouts/new')
        .expect(200)
        .then((res) => {
          expect(res.body.workoutData).to.have.property('created_by');
          expect(res.body.workoutData.workout_name).to.equal('new');
          expect(res.body.workoutData.created_by).to.equal('me');
        });
    });
  });
  describe('/muscles/:muscle', () => {
    it('GET - 200 & returns the muscle name and description', () => {
      return request.get('/api/muscles/chest')
      .expect(200)
      .then((res) => {
        expect(res.body.muscleData.muscle_name).to.equal('chest');
      })
    });
  });
});
