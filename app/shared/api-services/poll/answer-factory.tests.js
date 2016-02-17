'use strict';

describe('Answer Factory', function () {
  var $httpBackend,
      answer,
      answerFactory,
      scope,
      pollId;

  beforeEach(module('apiServices.answer.factory'));

  beforeEach(inject(function(_$httpBackend_, _Answer_) {
    answerFactory = _Answer_;
    $httpBackend = _$httpBackend_;

    scope = {
      deletedAnswers:  [{ id: 1, answer_text: 'Go Spurs Go!' }],
      model: {
        id: 777,
        answers: [{id: 2, notOnSodahead: true, answer_text: 'wingapo'}]
      },
      answers: [{id: 2, answer_text: 'feel the flo'}]
    };
  }));

  describe('postAnswer()', function () {
    it('makes a post request', function () {
      answer = scope.model.answers[0];
      pollId = scope.model.id;
      answerFactory.postAnswer(answer, pollId);
      $httpBackend.expectPOST('/cms/api/v1/answer/').respond(201);
      $httpBackend.flush();
    });
  });

  describe('updatePollAnswers()', function () {
    it('deletes any answers in deletedAnswers', function () {
      scope.model.answers = [];
      answerFactory.updatePollAnswers(scope);
      $httpBackend.expectDELETE('/cms/api/v1/answer/1').respond(201);
      $httpBackend.flush();
    });

    it('posts answers tagged notOnSodahead', function () {
      scope.deletedAnswers = [];
      answerFactory.updatePollAnswers(scope);
      $httpBackend.expectPOST('/cms/api/v1/answer/').respond(201);
      $httpBackend.flush();
    });

    it('updates existing answers', function () {
      scope.deletedAnswers = [];
      scope.model.answers[0].notOnSodahead = false;
      answerFactory.updatePollAnswers(scope);
      $httpBackend.expectPUT('/cms/api/v1/answer/2').respond(201);
      $httpBackend.flush();
    });
  });
});
