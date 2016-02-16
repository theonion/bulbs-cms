'use strict';

describe('Answer Factory', function () {
  var $httpBackend,
      $q,
      data,
      mockPayload,
      moment,
      Poll,
      pollId,
      pollUrl,
      response;

  beforeEach(module('apiServices.poll.factory'));

  beforeEach(inject(function(_$httpBackend_, _$q_, _moment_, _Poll_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    moment = _moment_;
    Poll = _Poll_;

    pollUrl = '/cms/api/v1/poll/';
    mockPayload = {
      id: 231272,
      authors: [ ],
      status: 'draft',
      answers: [ ],
      title: 'I can do stuff',
      question_text: 'lalala',
      sodahead_id: '4860960',
      end_date: '2016-02-11T19:24:28.363000Z'
    };
  }));

  describe('getPoll()', function () {
    it('makes a get request', function () {
      pollId = 27;
      Poll.getPoll(pollId);
      $httpBackend.expectGET(pollUrl + pollId).respond(200, mockPayload);
      $httpBackend.flush();
    });

    it('converts end_date from string to moment object', function () {
      pollId = 27;
      $httpBackend.expectGET(pollUrl + pollId).respond(200, mockPayload);
      Poll.getPoll(pollId).then(function(res) {
        response = res;
      });
      $httpBackend.flush();
      expect(response.end_date).toEqual(jasmine.any(Object));
    });

    it('returns the mock payload', function () {
      pollId = 223;
      $httpBackend.expectGET(pollUrl + pollId).respond(200, mockPayload);
      Poll.getPoll(pollId).then(function(res) {
        response = res;
      });
      $httpBackend.flush();
      expect(response.id).toEqual(mockPayload.id);
    });
  });

  describe('postPoll()', function () {
    it('makes a post request', function () {
      data = {
        title: 'This is a poll',
        question_text: 'this is a question',
      };
      Poll.postPoll(data);
      $httpBackend.expectPOST(pollUrl).respond(200);
      $httpBackend.flush();
    });

    it('converts moment object to string', function () {
      data = {
        title: 'This is a poll',
        question_text: 'this is a question',
      };
      Poll.postPoll(data).then(function(res) {
        response = res;
      });
      $httpBackend.expectPOST(pollUrl).respond(200, mockPayload);
      $httpBackend.flush();
      expect(response.end_date).toEqual(jasmine.any(String));
    });

    it('returns the mockpayload', function() {
      Poll.postPoll(data).then(function(res) {
        response = res;
      });
      $httpBackend.expectPOST(pollUrl).respond(200, mockPayload);
      expect(response).toEqual(mockPayload);
    });
  });

  describe('updatePoll()', function () {
    it('makes a put request', function () {
      data = {
        id: 12,
        title: 'This is a poll',
        question_text: 'this is a question',
      };
      Poll.updatePoll(data);
      $httpBackend.expectPUT(pollUrl + data.id).respond(201);
      $httpBackend.flush();
    });

    it('handles end_date moment objects', function() {
      data = {
        id: 12,
        title: 'This is a poll',
        question_text: 'this is a question',
        end_date: moment('2022-12-25', 'YYYY-MM-DD')
      };
      Poll.updatePoll(data).then(function (res) {
        response = res;
        });
        $httpBackend.expectPUT(pollUrl + data.id).respond(200, mockPayload);
        $httpBackend.flush();
        expect(response).toEqual(mockPayload);
    });
  });

  describe('deletePoll()', function () {
    it('makes a delete request', function () {
      pollId = 89;
      Poll.deletePoll(pollId);
      $httpBackend.expectDELETE(pollUrl + pollId).respond(201);
      $httpBackend.flush();
    });
  });
});
