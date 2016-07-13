'use strict';

describe('Directive: dynamicContentFormFieldImage', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module(
      'bulbs.cms.dynamicContent.form.field.image',
      function ($compileProvider) {
        window.testHelper.directiveMock($compileProvider, 'bettyEditable');
        window.testHelper.directiveMock($compileProvider, 'staticImage');
      }
    );
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a betty-editable by default', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-image ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-image>' +
      '</form>';
    $parentScope.name = 'my_image';
    $parentScope.ngModel = { id: 1 };
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.find('betty-editable').length).to.equal(1);
  });

  it('should render a static image when given a schema with read_only', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-image ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-image>' +
      '</form>';
    $parentScope.name = 'my_image';
    $parentScope.ngModel = { id: 1 };
    $parentScope.schema = { read_only: true };

    var element = digest(html);

    expect(element.find('static-image').length).to.equal(1);
  });
});
