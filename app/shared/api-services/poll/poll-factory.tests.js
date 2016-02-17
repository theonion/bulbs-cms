'use strict';

describe('Answer Factory', function () {
  var $httpBackend,
  data,
  pollFactory,
  pollId;

  beforeEach(module('apiServices.poll.factory'));

  beforeEach(inject(function(_$httpBackend_, _Poll_) {
    pollFactory = _Poll_;
    $httpBackend = _$httpBackend_;

  }));

  describe('getPoll()', function () {
    it('makes a get request', function () {
      pollId = 27;
      pollFactory.getPoll(pollId);
      $httpBackend.expectGET('/cms/api/v1/poll/27').respond(201);
      $httpBackend.flush();
    });
  });

  describe('getPolls()', function () {
    it('makes a get request', function () {
      pollFactory.getPolls();
      $httpBackend.expectGET('/cms/api/v1/poll/').respond(200);
      $httpBackend.flush();
    });
  });

  describe('postPoll()', function () {
    it('makes a post request', function () {
      data = {
        title: 'This is a poll',
        question_text: 'this is a question',
      };
      pollFactory.postPoll(data);
      $httpBackend.expectPOST('/cms/api/v1/poll/').respond(200);
      $httpBackend.flush();
    });
  });

  describe('updatePoll()', function () {
    it('makes a put request', function () {
      data = {
        id: 12,
        title: 'This is a poll',
        question_text: 'this is a question',
      };
      pollFactory.updatePoll(data);
      $httpBackend.expectPUT('/cms/api/v1/poll/12').respond(201);
      $httpBackend.flush();
    });
  });

  describe('deletePoll()', function () {
    it('makes a delete request', function () {
      pollId = 89;
      pollFactory.deletePoll(pollId);
      $httpBackend.expectDELETE('/cms/api/v1/poll/89').respond(201);
      $httpBackend.flush();
    });
  });
});
