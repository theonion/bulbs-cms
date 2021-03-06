'use strict';

describe('Directive: dynamicContentFormFieldDate', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.dateTime');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a date time selection modal opener', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-date-time ' +
          'name="{{ name }}" ' +
          'ng-model="ngModel" ' +
          'schema="schema" ' +
          '>' +
        '</dynamic-content-form-field-date-time>' +
      '</form>';
    $parentScope.name = 'publish_date';
    $parentScope.ngModel = { publish_date: '2016-12-20T00:00:00' };
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.find('button').attr('datetime-selection-modal-opener'))
      .to.equal('');
  });

  it('should render an empty message when date not set', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-date-time ' +
          'name="{{ name }}" ' +
          'ng-model="ngModel" ' +
          'schema="schema" ' +
          '>' +
        '</dynamic-content-form-field-date-time>' +
      '</form>';
    $parentScope.name = 'publish_date';
    $parentScope.ngModel = { publish_date: null };
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.html()).to.have.string('click to set date/time');
  });

  it('should allow date to be cleared', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-date-time ' +
          'name="{{ name }}" ' +
          'ng-model="ngModel" ' +
          'schema="schema" ' +
          '>' +
        '</dynamic-content-form-field-date-time>' +
      '</form>';
    $parentScope.name = 'publish_date';
    $parentScope.ngModel = { publish_date: '2016-04-20T00:00:00' };
    $parentScope.schema = {};


    var element = digest(html);
    var directiveScope = element
      .find('dynamic-content-form-field-date-time')
      .isolateScope();
    directiveScope.clearDate();
    $parentScope.$digest();

    expect(directiveScope.$parent.ngModel.publish_date).to.equal(null);
  });

  it('should render static html when given a schema with read_only', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-date-time ' +
          'name="{{ name }}" ' +
          'ng-model="ngModel" ' +
          'schema="schema" ' +
          '>' +
        '</dynamic-content-form-field-date-time>' +
      '</form>';
    $parentScope.name = 'publish_date';
    $parentScope.ngModel = { publish_date: '2016-12-20T00:00:00' };
    $parentScope.schema = { read_only: true };

    var element = digest(html);

    expect(element.find('button').length).to.equal(0);
    expect(element.find('div').attr('datetime-selection-modal-opener'))
      .to.equal(undefined);
  });

  it('should render a required field when given a schema with required', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-date-time ' +
          'name="{{ name }}" ' +
          'ng-model="ngModel" ' +
          'schema="schema" ' +
          '>' +
        '</dynamic-content-form-field-date-time>' +
      '</form>';
    $parentScope.name = 'publish_date';
    $parentScope.ngModel = { publish_date: '2016-12-20T00:00:00' };
    $parentScope.schema = { required: true };

    var element = digest(html);

    expect(element.find('input').attr('required')).to.equal('required');
  });
});
