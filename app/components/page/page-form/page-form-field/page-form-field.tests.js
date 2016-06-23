'use strict';

describe('Directive: pageForm', function () {

  beforeEach(function () {
    module('bulbs.cms.page.form.field');
    module('jsTemplates');
  });

  it('should error if parent is not a <page-form>', function () {
    var badDigestedScope;

    inject(function ($compile, $rootScope) {
      badDigestedScope = window.testHelper.directiveBuilder(
        $compile,
        $rootScope,
        angular.element('<page-form-field></page-form-field>')
      );
    });

    expect(function () {
      badDigestedScope();
    }).to.throw(
      Error,
      /pageForm.*required/
    );
  });

  context('normal usage', function () {
    var digestedScope;
    var html;

    beforeEach(function () {
      inject(function ($compile, $rootScope) {
        var requiredParentHtml = angular.element('<page-form></page-form>');
        requiredParentHtml.data('$pageFormController', function () {});

        html = angular.element('<page-form-field></page-form-field>');
        requiredParentHtml.append(html);

        digestedScope = window.testHelper.directiveBuilder($compile, $rootScope, requiredParentHtml);
      });
    });

    it('should render a <page-form-field-text> when given a schema with a type of "text"', function () {
      html.attr('schema', JSON.stringify({ type: 'text' }));

      digestedScope();

      expect(html.find('page-form-field-text').length).to.equal(1);
    });
  });
});
