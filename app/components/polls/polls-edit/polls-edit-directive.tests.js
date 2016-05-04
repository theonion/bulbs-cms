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
      scope,
      momentjs;

  html = '<polls-edit></polls-edit>';

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  beforeEach(inject(function(_$compile_, _$httpBackend_, _$routeParams_, _$rootScope_, _$timeout_, moment) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $routeParams = _$routeParams_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    momentjs = moment;

    $routeParams.id = 'new';

    element = $compile(html)($rootScope);
    $rootScope.$digest();
    scope = element.isolateScope();
  }));

  it('creates a new poll object on the scope', function () {
    expect(scope.model).to.be.an.instanceof(Object);
    expect(scope.isNew).to.equal(true);
  });

  it('has appropriate new poll fields', function () {
    expect(element.html()).to.contain('Question');
    expect(element.html()).to.contain('Responses');
  });

  it('has appropriate edit poll fields', function () {
    scope.$apply(function () {
      scope.model.id = '1';
    });
    expect(element.html()).to.contain('Poll Name');
    expect(element.html()).to.contain('Poll End Date');
  });

  it('scope initializes with 3 empty answer objects', function () {
    expect(scope.answers.length).to.equal(3);
    scope.answers.forEach(function(answer) {
      expect(answer).to.be.an.instanceof(Object);
    });
  });

  describe('scope.addAnswer()', function () {
    it('adds answer text fields', function () {
      // sanity check
      var answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).to.equal(3);
      scope.addAnswer();
      scope.$apply();
      answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).to.equal(4);
    });

    it('creates field notOnSodahead for answer', function () {
      // clear out answers
      scope.answers = [];
      scope.addAnswer();
      // sanity check
      expect(scope.answers.length).to.equal(1);
      expect(scope.answers[0].notOnSodahead).to.equal(true);
    });
  });

  describe('scope.removeAnswer()', function () {
    it('removes answer text fields', function () {
      // sanity check
      var answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).to.equal(3);

      scope.removeAnswer(1);
      scope.$apply();
      answerTextAreaCount = element.find('.answer-text').length;
      expect(answerTextAreaCount).to.equal(2);
    });

    it('adds answers not on sodahead to scope.deletedAnswers', function () {
      // sanity check
      expect(scope.deletedAnswers.length).to.equal(0);
      // mock out answer on sodahead
      scope.answers[0].notOnSodahead = false;
      answer = scope.answers[0];
      scope.removeAnswer(answer.id);
      expect(scope.deletedAnswers[0]).to.equal(answer);
    });

    it('does not add answers not on sodahead to scope.deletedAnswers', function () {
      // sanity check
      expect(scope.deletedAnswers.length).to.equal(0);
      // mock out answer on sodahead
      answer = scope.answers[0];
      scope.removeAnswer(answer.id);
      expect(scope.deletedAnswers.length).to.equal(0);
    });
  });

  describe('validation messages', function () {
    beforeEach(function () {
      // forces directive into 'edit' mode
      // helps us test ALL validations
      scope.$apply(function () {
        scope.model.id = 1;
      });
    });

    it('shows validation message when title is valid', function () {
      var input = element.find('input[name=title]');
      input.val('').trigger('input');

      expect(
        element.find('label[for=pollTitle] .error-message.ng-hide').length
      ).to.equal(0);
    });

    it('hides validation message when title is invalid', function () {
      var input = element.find('input[name=title]');
      input.val('anything').trigger('input');

      expect(
        element.find('label[for=pollTitle] .error-message.ng-hide').length
      ).to.equal(1);
    });

    it('shows validation message when question text is valid', function () {
      var input = element.find('textarea[name=question_text]');
      input.val('').trigger('input');

      expect(
        element.find('label[for=pollQuestionText] .error-message.ng-hide').length
      ).to.equal(0);
    });

    it('hides validation message when question text is invalid', function () {
      var input = element.find('textarea[name=question_text]');
      input.val('anything').trigger('input');

      expect(
        element.find('label[for=pollQuestionText] .error-message.ng-hide').length
      ).to.equal(1);
    });

    it('shows validation message when answer text is invalid', function () {
      var input = element.find('textarea[name=answer_text]:first');
      input.val('').trigger('input');

      expect(
        element.find('label[for=answerText]:first .error-message.ng-hide').length
      ).to.equal(0);
    });

    it('hides validation message when answer text is invalid', function () {
      var input = element.find('textarea[name=answer_text]:first');
      input.val('anything').trigger('input');

      expect(
        element.find('label[for=answerText]:first .error-message.ng-hide').length
      ).to.equal(1);
    });

    it('shows validation message when there is an end date but no published date', function () {
      scope.model.end_date = momentjs();
      scope.validatePublication();
      $timeout.flush();

      expect(
        element.find('label[for=pollStartDate] .error-message.ng-hide').length
      ).to.equal(0);
    });

    it('hides validation message when there is no end date', function () {
      scope.model.end_date = undefined;
      scope.validatePublication();
      $timeout.flush();

      expect(
        element.find('label[for=pollStartDate] .error-message.ng-hide').length
      ).to.equal(1);
    });

    it('hides validation message when there is only a published date', function () {
      scope.model.published = momentjs();
      scope.validatePublication();
      $timeout.flush();

      expect(
        element.find('label[for=pollStartDate] .error-message.ng-hide').length
      ).to.equal(1);
    });

    it('shows validation message when end date is before published date', function () {
      scope.model.published = momentjs().add(1, 'day');
      scope.model.end_date = momentjs();
      scope.validatePublication();
      $timeout.flush();

      expect(
        element.find('label[for=pollEndDate] .error-message.ng-hide').length
      ).to.equal(0);
    });

    it('hides validation message when end date is after published date', function () {
      scope.model.published = momentjs();
      scope.model.end_date = momentjs().add(1, 'day');
      scope.validatePublication();
      $timeout.flush();

      expect(
        element.find('label[for=pollEndDate] .error-message.ng-hide').length
      ).to.equal(1);
    });
  });
});
