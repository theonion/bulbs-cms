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
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = {
      test: [{
        title: 'one'
      }, {
        title: 'two'
      }]
    };

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(2);
  });

  it('should list at least one set of fields if there are no values in given ng-model', function () {
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [] };

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });

  it('should allow adding a new item', function () {
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [{ title: 'one' }] };

    var addButton = digest(html).find('button[ng-click="newItem()"]').eq(0);
    addButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel.test[1].title).to.equal(mockInitialValue);
    expect(html.find('dynamic-content-form-field-object').length).to.equal(2);
  });

  it('should allow ordering of items', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [item1, item2] };

    var downButton = digest(html).find('button[ng-click="moveItem($index, $index + 1)"]').eq(0);
    downButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel.test[0].title).to.equal(item2.title);
    expect($parentScope.ngModel.test[1].title).to.equal(item1.title);
  });

  it('should allow ordering of items via number input', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var item3 = { title: 'three' };
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [item1, item2, item3] };

    var element = digest(html);
    var input = element.find('input[ng-model="itemOrderingMemory[$index]"]').eq(0);
    var moveButton = element.find('button[ng-click*="moveItem"]').eq(0);

    input.val(3);
    input.trigger('change');
    moveButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel.test[0].title).to.equal(item3.title);
    expect($parentScope.ngModel.test[1].title).to.equal(item2.title);
    expect($parentScope.ngModel.test[2].title).to.equal(item1.title);
  });

  it('should disable the up ordering button if first itme in list', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [item1, item2] };

    var upButton = digest(html).find('button[ng-click="moveItem($index, $index - 1)"]').eq(0);
    upButton.trigger('click');
    $parentScope.$digest();

    expect(upButton.attr('disabled')).to.equal('disabled');
    expect($parentScope.ngModel.test[0].title).to.equal(item1.title);
    expect($parentScope.ngModel.test[1].title).to.equal(item2.title);
  });

  it('should disable the down ordering button if last item in list', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [item1, item2] };

    var downButton = digest(html).find('button[ng-click="moveItem($index, $index + 1)"]').eq(1);
    downButton.trigger('click');
    $parentScope.$digest();

    expect(downButton.attr('disabled')).to.equal('disabled');
    expect($parentScope.ngModel.test[0].title).to.equal(item1.title);
    expect($parentScope.ngModel.test[1].title).to.equal(item2.title);
  });

  it('should allow deleting an item', function () {
    var item1 = { title: 'one' };
    var item2 = { title: 'two' };
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="test" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { test: [item1, item2] };

    var deleteButton = digest(html).find('button[ng-click="removeItem($index)"]').eq(0);
    deleteButton.trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel.test[0].title).to.equal(item2.title);
    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });

  it('should initialize given value to an empty list if null or undefined', function () {
    var name = 'my_list';
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-list ' +
            'name="' + name + '" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = { fields: {} };
    $parentScope.ngModel = {};

    digest(html);

    expect($parentScope.ngModel[name]).to.be.an.instanceof(Array);
  });

  it('should show an error icon if containing form is invalid', function () {
    var name = 'test';
    var formName = 'testForm';
    var html = angular.element(
      '<form name="' + formName + '">' +
        '<dynamic-content-form-field-list ' +
            'name="' + name + '" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = {
      fields: {
        title: {
          type: 'mock',
          required: true
        }
      }
    };
    $parentScope.ngModel = {};
    $parentScope.ngModel[name] = [{ title: '' }];
    var element = digest(html);

    element.find('li').scope().isItemValid = false;
    element.scope()[formName].$setDirty();
    $parentScope.$digest();

    expect(
      element.find('.dynamic-content-form-field-list-item-meta-label-error').length
    ).to.equal(1);
  });

  it('should not render error if in an invalid state but form is pristine', function () {
    var name = 'test';
    var formName = 'testForm';
    var html = angular.element(
      '<form name="' + formName + '">' +
        '<dynamic-content-form-field-list ' +
            'name="' + name + '" ' +
            'schema="schema" ' +
            'ng-model="ngModel" ' +
            '>' +
        '</dynamic-content-form-field-list>' +
      '</form>'
    );
    $parentScope.schema = {
      fields: {
        title: {
          type: 'mock',
          required: true
        }
      }
    };
    $parentScope.ngModel = {};
    $parentScope.ngModel[name] = [{ title: '' }];
    var element = digest(html);

    element.find('li').scope().isItemValid = false;
    element.scope()[formName].$setPristine();
    $parentScope.$digest();

    expect(
      element.find('.dynamic-content-form-field-list-item-meta-label-error').length
    ).to.equal(0);
  });
});
