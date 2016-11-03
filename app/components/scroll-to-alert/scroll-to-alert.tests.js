'use strict';

describe('Directive: scrollToAlert', function () {

  var $;
  var $parentScope;
  var digest;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.scrollToAlert');
    module('jsTemplates');

    inject(function (_$_, $compile, $rootScope) {

      $ = _$_;
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('label', function () {

    it('should allow a customized label', function () {
      $parentScope.label = 'My Label';
      var element = digest('<scroll-to-alert label="{{ label }}"></scroll-to-alert>');

      element.scope().$digest();

      expect(element.html()).to.have.string($parentScope.label);
    });

    it('should default label to "Scroll"', function () {
      var element = digest('<scroll-to-alert></scroll-to-alert>');

      element.scope().$digest();

      expect(element.html()).to.have.string('Scroll');
    });
  });

  context('scrolling', function () {

    it('should scroll to given location when clicked', function () {
      $parentScope.scrollLocation = 100;
      var element = digest('<scroll-to-alert new-scroll-top="scrollLocation"></scroll-to-alert>');
      element.scope().$digest();
      sandbox.stub($.fn, 'animate');

      element.find('span').click();

      expect($.fn.animate.calledOnce).to.equal(true);
      expect($.fn.animate.args[0][0]).to.eql({ scrollTop: $parentScope.scrollLocation });
    });

    it('should remove itself from the DOM when scrolling begins', function () {
      var element = digest('<scroll-to-alert></scroll-to-alert>');
      element.scope().$digest();

      element.find('span').click();

      expect(document.contains(element[0])).to.equal(false);
    });
  });

  context('dismiss', function () {

    it('should remove itself from the DOM and stop scrolling', function () {
      var element = digest('<scroll-to-alert></scroll-to-alert>');
      element.scope().$digest();

      element.find('i').click();

      expect(document.contains(element[0])).to.equal(false);
    });
  });
});

