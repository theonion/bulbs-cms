'use strict';

describe('Directive: dynamicContentFormFieldObject', function () {
  var $parentScope;
  var digest;
  var mockDirectiveNameKey = 'mock';
  var mockDirectiveName = 'dynamic-content-form-field-mock';
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.dynamicContent.form.field.object',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldMock');

        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldList');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldText');

        var key = 'FIELD_TYPES_META';
        var mapCopy = angular.copy($injector.get(key));
        mapCopy[mockDirectiveNameKey] = { tagName: mockDirectiveName };

        $provide.constant(key, mapCopy);
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

  afterEach(function () {
    sandbox.restore();
  });

  xit('should render checkbox', function () {
    var html = angular.element(
      '<form>' +
      '</form>'
    );

    $parentScope.schema = {};
    $parentScope.ngModel = {};

    digest(html);

    var input = html.find('[type="checkbox"]');
    expect(input.length).to.eql(1);
  });

});
