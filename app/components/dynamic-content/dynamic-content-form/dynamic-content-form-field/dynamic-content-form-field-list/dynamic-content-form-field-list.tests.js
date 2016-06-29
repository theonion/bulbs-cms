'use strict';

describe('Directive: dynamicContentFormFieldList', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module(
      'bulbs.cms.dynamicContent.form.field.list',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldMock');

        var key = 'DIRECTIVE_NAMES_MAP';
        var mapCopy = angular.copy($injector.get(key));
        mapCopy['mock'] = 'dynamic-content-form-field-mock';

        $provide.constant(key, mapCopy);
      }
    );
    module('ng');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should repeat given schema for each value instance in given values', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list name="test" schema="schema" values="values">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = {
      title: { field_type: 'mock' }
    };
    $parentScope.values = [{
      title: 'one'
    }, {
      title: 'two'
    }];

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(2);
  });
});
