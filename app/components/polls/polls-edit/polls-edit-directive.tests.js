'use strict';

describe('Directive: pollsEdit', function () {
  var $compile,
      $httpBackend,
      $routeParams,
      $rootScope,
      $timeout,
      answer,
      element,
      html,
      scope;

  html = '<polls-edit></polls-edit>';

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  beforeEach(inject(function(_$compile_, _$httpBackend_, _$routeParams_, _$rootScope_, _$timeout_) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $routeParams = _$routeParams_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;

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
    expect(scope.answers).toEqual(response);
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
      scope.answers = [];
      scope.addAnswer();
      // sanity check
      expect(scope.answers.length).toEqual(1);
      expect(scope.answers[0].notOnSodahead).toBe(true);
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
      scope.answers[0].notOnSodahead = false;
      answer = scope.answers[0];
      scope.removeAnswer(answer.id);
      expect(scope.deletedAnswers[0]).toEqual(answer);
    });

    it('does not add answers not on sodahead to scope.deletedAnswers', function () {
      // sanity check
      expect(scope.deletedAnswers.length).toEqual(0);
      // mock out answer on sodahead
      answer = scope.answers[0];
      scope.removeAnswer(answer.id);
      expect(scope.deletedAnswers.length).toEqual(0);
    });
  });

  describe('validations', function () {
    // These validation tests follow this format:

    // Test invalid state
    // Test valid state
    it('requires question title', function () {
      var input = element.find('input[name=title]');
      input.val('').trigger('input');
      expect(
        element.find('label[for=pollTitle] .error-message.ng-hide').length
      ).toBe(0);

      input.val('anything').trigger('input');
      expect(
        element.find('label[for=pollTitle] .error-message.ng-hide').length
      ).toBe(1);
    });

    it('requires question text', function () {
      var input = element.find('textarea[name=question_text]');
      input.val('').trigger('input');
      expect(
        element.find('label[for=pollQuestionText] .error-message.ng-hide').length
      ).toBe(0);

      input.val('anything').trigger('input');
      expect(
        element.find('label[for=pollQuestionText] .error-message.ng-hide').length
      ).toBe(1);
    });

    it('requires answer text', function () {
      var input = element.find('textarea[name=answer_text]:first');
      input.val('').trigger('input');

      expect(
        element.find('label[for=answerText]:first .error-message.ng-hide').length
      ).toBe(0);

      input.val('anything').trigger('input');
      expect(
        element.find('label[for=answerText]:first .error-message.ng-hide').length
      ).toBe(1);
    });

    it('polls with an end date require a published date', function () {
      scope.model.end_date = moment.now();
      scope.validatePublication();
      $timeout.flush();
      expect(
        element.find('label[for=pollStartDate] .error-message.ng-hide').length
      ).toBe(0);

      scope.model.end_date = undefined;
      scope.validatePublication();
      $timeout.flush();
      expect(
        element.find('label[for=pollStartDate] .error-message.ng-hide').length
      ).toBe(1);
    });

    it('requires end date to be after start date', function () {
      scope.model.published = moment().add(1, 'day');
      scope.model.end_date = moment();
      scope.validatePublication();
      $timeout.flush();
      expect(
        element.find('label[for=pollEndDate] .error-message.ng-hide').length
      ).toBe(0);

      scope.model.end_date = moment.now();

      scope.model.published = moment();
      scope.model.end_date = moment().add(1, 'day');
      scope.validatePublication();
      $timeout.flush();
      expect(
        element.find('label[for=pollEndDate] .error-message.ng-hide').length
      ).toBe(1);
    });
  });
});
