'use strict';

describe('Directive: dynamicContentFormFieldList', function () {
  var $parentScope;
  var digest;
  var mockFieldObject;
  var mockInitialValue = 'my garbage';

  beforeEach(function () {
    module(
      'bulbs.cms.dynamicContent.form.field.list',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldMock');

        mockFieldObject = function () {
          window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldObject');
        };

        var key = 'FIELD_TYPES_META';
        var mapCopy = angular.copy($injector.get(key));
        mapCopy['mock'] = {
          initialValue: mockInitialValue,
          tagName: 'dynamic-content-form-field-mock'
        };

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

  it('should repeat given schema for each value instance in given ng-model', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list name="test" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [{
      title: 'one'
    }, {
      title: 'two'
    }];

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(2);
  });

  it('should list at least one set of fields if there are no values in given ng-model', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list name="test" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [];

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });

  it('should allow adding a new item', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list name="test" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [{ title: 'one' }];

    var $scope = digest(html).isolateScope();
    $scope.newItem();
    $scope.$digest();

    expect($scope.ngModel[1].title).to.equal(mockInitialValue);
    expect(html.find('dynamic-content-form-field-object').length).to.equal(2);
  });

  it('should render a form', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list name="name" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: {} };
    $parentScope.ngModel = [];
    mockFieldObject();

    digest(html);

    var form = html.find('ng-form');
    expect(form.length).to.eql(1);
    expect(form.attr('name')).to.eql('form');
  });
});
