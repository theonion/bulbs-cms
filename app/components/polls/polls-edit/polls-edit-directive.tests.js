'use strict';

describe('Directive: pollsEdit', function () {
  var $compile,
      $httpBackend,
      $routeParams,
      $rootScope,
      answer,
      element,
      html,
      scope;

  html = '<polls-edit></polls-edit>';

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  beforeEach(inject(function(_$compile_, _$httpBackend_, _$routeParams_, _$rootScope_) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $routeParams = _$routeParams_;
    $rootScope = _$rootScope_;

    $routeParams.id = 'new';

    element = $compile(html)($rootScope);
    $rootScope.$digest();
    scope = element.isolateScope();
  }));

  it('creates a new poll object on the scope', function () {
    expect(scope.model).toEqual(jasmine.any(Object));
    expect(scope.isNew).toBe(true);
  });

  it('has appropriate poll fields', function () {
    expect(element.html()).toContain('Poll Name');
    expect(element.html()).toContain('Poll End Date');
    expect(element.html()).toContain('Question');
    expect(element.html()).toContain('Responses');
  });

  it('scope initializes with 3 empty answer objects', function () {
    var response = [jasmine.any(Object), jasmine.any(Object), jasmine.any(Object)];
    expect(scope.model.answers).toEqual(response);
  });

  describe('scope.addAnswer()', function () {
    it('adds answer text fields', function () {
      // sanity check
      var answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).toEqual(3);
      scope.addAnswer();
      scope.$apply();
      answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).toEqual(4);
    });

    it('creates field notOnSodahead for answer', function () {
      // clear out answers
      scope.model.answers = [];
      scope.addAnswer();
      // sanity check
      expect(scope.model.answers.length).toEqual(1);
      expect(scope.model.answers[0].notOnSodahead).toBe(true);
    });
  });

  describe('scope.removeAnswer()', function () {
    it('removes answer text fields', function () {
      // sanity check
      var answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).toEqual(3);

      scope.removeAnswer(1);
      scope.$apply();
      answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).toEqual(2);
    });

    it('adds answers not on sodahead to scope.deletedAnswers', function () {
      // sanity check
      expect(scope.deletedAnswers.length).toEqual(0);
      // mock out answer on sodahead
      scope.model.answers[0].notOnSodahead = false;
      answer = scope.model.answers[0];
      scope.removeAnswer(answer.id);
      expect(scope.deletedAnswers[0]).toEqual(answer);
    });

    it('does not add answers not on sodahead to scope.deletedAnswers', function () {
      // sanity check
      expect(scope.deletedAnswers.length).toEqual(0);
      // mock out answer on sodahead
      answer = scope.model.answers[0];
      scope.removeAnswer(answer.id);
      expect(scope.deletedAnswers.length).toEqual(0);
    });
  });

  describe('scope.postSodaheadAnswer()', function () {
    it('posts answer to sodahead poll', function () {
      answer = {id: 1, answerText: 'text'};
      scope.model.$pk = 11;
      scope.postSodaheadAnswer(answer);
      $httpBackend.expectPOST('/cms/api/v1/answer/').respond(201);
      $httpBackend.flush();
    });
  });

  describe('scope.putSodaheadAnswer()', function () {
    it('puts updated answer to sodahead poll', function () {
      answer = {id: 1, answerText: 'texty'};
      scope.poll = {};
      scope.poll.answers = [{id: 1, answerText: 'text'}];
      scope.putSodaheadAnswer(answer);
      $httpBackend.expectPUT('/cms/api/v1/answer/1').respond(200);
      $httpBackend.flush();
    });
  });

  describe('scope.deleteSodaheadAnswers()', function () {
    it('makes a delete request', function () {
      scope.deletedAnswers = [{id: 1, answerText: 'text'}];
      scope.deleteSodaheadAnswers();
      $httpBackend.expectDELETE('/cms/api/v1/answer/1').respond(301);
      $httpBackend.flush();
      expect(scope.deletedAnswers.length).toEqual(0);
    });

    it('resets scope.deletedAnswers', function () {
      // sanity check
      scope.deletedAnswers = [{id: 1, answerText: 'text'}];
      expect(scope.deletedAnswers.length).toEqual(1);
      scope.deleteSodaheadAnswers();
      expect(scope.deletedAnswers.length).toEqual(0);
    });
  });
});
