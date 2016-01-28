'use strict';

describe('Directive: pollsEdit', function () {
  var $compile,
      $httpBackend,
      $routeParams,
      $rootScope,
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

  it('adds answer text fields', function () {
    // sanity check
    var answerTextAreaCount = element.find('.answer-text').length;
    expect(answerTextAreaCount).toEqual(3);

    scope.addAnswer();
    scope.$apply();
    answerTextAreaCount = element.find('.answer-text').length;
    expect(answerTextAreaCount).toEqual(4);
  });

  it('removes answer text fields', function () {
    // sanity check
    var answerTextAreaCount = element.find('.answer-text').length;
    expect(answerTextAreaCount).toEqual(3);

    scope.removeAnswer(0);
    scope.$apply();
    answerTextAreaCount = element.find('.answer-text').length;
    expect(answerTextAreaCount).toEqual(2);
  });
});
