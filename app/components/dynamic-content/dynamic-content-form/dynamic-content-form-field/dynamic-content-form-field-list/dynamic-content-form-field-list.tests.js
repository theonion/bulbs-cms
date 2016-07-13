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
    module('jquery');
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

    var addButton = digest(html).find('button[ng-click="newItem()"]').eq(0);
    addButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel[1].title).to.equal(mockInitialValue);
    expect(html.find('dynamic-content-form-field-object').length).to.equal(2);
  });

  it('should prevent adding a new item if read only', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list ' +
        'name="test" ' +
        'schema="schema" ' +
        'ng-model="ngModel" ' +
        'read-only="true"' +
        '>' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [{ title: 'one' }];

    var addButton = digest(html).find('button[ng-click="newItem()"]').eq(0);
    addButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel.length).to.equal(1);
    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });

  it('should not show add button if read only', function () {
    var html = angular.element(
      '<dynamic-content-form-field-list ' +
        'name="test" ' +
        'schema="schema" ' +
        'ng-model="ngModel" ' +
        'read-only="true"' +
        '>' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [{ title: 'one' }];

    var element = digest(html);

    expect(element.find('button[ng-click="newItem()"]').length).to.equal(0);
  });

  it('should allow ordering of items', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var html = angular.element(
      '<dynamic-content-form-field-list name="test" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [item1, item2];

    var downButton = digest(html).find('button[ng-click="moveItem($index, $index + 1)"]').eq(0);
    downButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel[0].title).to.equal(item2.title);
    expect($parentScope.ngModel[1].title).to.equal(item1.title);
  });

  it('should allow deleting an item', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var html = angular.element(
      '<dynamic-content-form-field-list name="test" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-list>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = [item1, item2];

    var deleteButton = digest(html).find('button[ng-click="removeItem($index)"]').eq(0);
    deleteButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel[0].title).to.equal(item2.title);
    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });
});
