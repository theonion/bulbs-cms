'use strict';

describe('Directive: pageForm', function () {
  var sandbox;

  beforeEach(function () {
    module('bulbs.cms.page.form.field');
    module('jsTemplates');

    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('normal usage', function () {
    var digestedScope;
    var formName = 'pageForm';
    var html;
    var parentHtml;

    beforeEach(function () {
      inject(function ($compile, $rootScope) {
        parentHtml = angular.element('<page-form><form name="' + formName + '"></form></page-form>');

        html = angular.element('<page-form-field></page-form-field>');
        parentHtml.find('form').append(html);

        digestedScope = window.testHelper.directiveBuilder($compile, $rootScope, parentHtml);
      });
    });

    it('should render a <page-form-field-text> when given a schema with a type of "text"', function () {
      html.attr('schema', JSON.stringify({ type: 'text' }));

      digestedScope();

      expect(html.find('page-form-field-text').length).to.equal(1);
    });
  });
});
