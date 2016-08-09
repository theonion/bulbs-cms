'use strict';

describe('Answer Factory', function () {
  var $httpBackend;
  var Answer;
  var answer;
  var mockPayload;
  var response;
  var scope;
  var pollId;

  beforeEach(module('apiServices.answer.factory'));

  beforeEach(inject(function(_$httpBackend_, _Answer_) {
    Answer = _Answer_;
    $httpBackend = _$httpBackend_;

    mockPayload = {
      id: 203,
      answer_text: 'texty text',
      poll: 123456
    };

  }));

  describe('postAnswer()', function () {
    it('makes a post request', function () {
      answer = {id: 2, notOnSodahead: true, answer_text: 'wingapo'};
      pollId = 12;
      Answer.postAnswer(answer, pollId);
      $httpBackend.expectPOST('/cms/api/v1/poll-answer/').respond(201);
      $httpBackend.flush();
    });

    it('returns answer payload', function() {
      answer = {id: 2, notOnSodahead: true, answer_text: 'wingapo'};
      pollId = 12;
      Answer.postAnswer(answer, pollId).then(function(res) {
        response = res;
      });
      $httpBackend.expectPOST('/cms/api/v1/poll-answer/').respond(201, mockPayload);
      $httpBackend.flush();
      expect(response).to.eql(mockPayload);
    });

    it('throws error if poll id is not a number', function() {
      var answerPost = function() {
        Answer.postAnswer({answer_text: 'bad data'}, 'this is a string');
      };
      expect(answerPost).to.throw('Poll Error: poll id and answer_text fields required');
    });

    it('throws error if answer_text is nil', function() {
      var answerPost = function() {
        Answer.postAnswer('bad data', 1235);
      };
      expect(answerPost).to.throw('Poll Error: poll id and answer_text fields required');
    });
  });

  describe('updatePollAnswers()', function () {
    it('deletes any answers in deletedAnswers', function () {
      scope = {
        deletedAnswers:  [{ id: 1, answer_text: 'Go Spurs Go!' }],
        model: {
          id: 777,
          answers: []
        }
      };
      Answer.updatePollAnswers(scope);
      $httpBackend.expectDELETE('/cms/api/v1/poll-answer/1').respond(201);
      $httpBackend.flush();
    });

    it('posts answers tagged notOnSodahead', function () {
      scope = {
        deletedAnswers:  [],
        model: {
          id: 777,
        },
        answers: [{id: 2, notOnSodahead: true, answer_text: 'foobar'}]
      };
      Answer.updatePollAnswers(scope);
      $httpBackend.expectPOST('/cms/api/v1/poll-answer/').respond(201);
      $httpBackend.flush();
    });

    it('updates existing answers', function () {
      scope = {
        deletedAnswers:  [],
        model: {
          id: 777,
          answers: [{id: 5, notOnSodahead: false, answer_text: 'nothing'}]
        },
        answers: [{id: 5, answer_text: 'feel the flo'}]
      };
      Answer.updatePollAnswers(scope);
      $httpBackend.expectPUT('/cms/api/v1/poll-answer/5').respond(201);
      $httpBackend.flush();
    });
  });
});
