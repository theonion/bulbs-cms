'use strict';

describe('Directive: dynamicContentFormFieldChoice', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.choice');
    module('jsTemplates');
    module('jquery');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should display a list of available choices', function () {
    var choice1 = { display_name: 'Circle', value: 0 };
    var choice2 = { display_name: 'Square', value: 1 };
    var html =
      '<form>' +
        '<dynamic-content-form-field-choice ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-choice>' +
      '</form>';
    $parentScope.name = 'shape';
    $parentScope.ngModel = { shape: 0 };
    $parentScope.schema = {
      label: 'Shape',
      choices: [choice1, choice2],
      type: 'choice'
    };

    var element = digest(html);

    var options = element.find('option');
    expect(options.length).to.equal(3);
    expect(options.eq(0).html()).to.have.string('Choose a ' + $parentScope.schema.label + '...');
    expect(options.eq(1).html()).to.have.string(choice1.display_name);
    expect(options.eq(2).html()).to.have.string(choice2.display_name);
  });

  it('should initially populate with the existing value', function () {
    var choice1 = { display_name: 'Circle', value: 0 };
    var choice2 = { display_name: 'Square', value: 1 };
    var html =
      '<form>' +
        '<dynamic-content-form-field-choice ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-choice>' +
      '</form>';
    $parentScope.name = 'shape';
    $parentScope.ngModel = { shape: 1 };
    $parentScope.schema = {
      label: 'Shape',
      choices: [choice1, choice2],
      type: 'choice'
    };

    var element = digest(html);

    var selectedOption = element.find('option[selected]');
    expect(selectedOption.html()).to.have.string(choice2.display_name);
  });

  it('should populate with the correct value when a slection is made', function () {
    var choice1 = { display_name: 'Circle', value: 0 };
    var choice2 = { display_name: 'Square', value: 1 };
    var html =
      '<form>' +
        '<dynamic-content-form-field-choice ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-choice>' +
      '</form>';
    $parentScope.name = 'shape';
    $parentScope.ngModel = { shape: 1 };
    $parentScope.schema = {
      label: 'Shape',
      choices: [choice1, choice2],
      type: 'choice'
    };

    var element = digest(html);
    element.find('option[value="0"]').trigger('click');
    $parentScope.$digest();

    expect($parentScope.ngModel.shape).to.equal(1);
  });

  it('should have required validation when given a schema with required', function () {
    var choice1 = { display_name: 'Circle', value: 0 };
    var choice2 = { display_name: 'Square', value: 1 };
    var html =
      '<form name="myForm">' +
        '<dynamic-content-form-field-choice ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-choice>' +
      '</form>';
    $parentScope.name = 'shape';
    $parentScope.ngModel = { shape: null };
    $parentScope.schema = {
      label: 'Shape',
      choices: [choice1, choice2],
      type: 'choice',
      required: true
    };

    var element = digest(html);

    expect(element.scope().myForm[$parentScope.name].$error.required).to.equal(true);
  });

  it('should render a readonly input when given a schema with read_only', function () {
    var choice1 = { display_name: 'Circle', value: 0 };
    var choice2 = { display_name: 'Square', value: 1 };
    var html =
      '<form name="myForm">' +
        '<dynamic-content-form-field-choice ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-choice>' +
      '</form>';
    $parentScope.name = 'shape';
    $parentScope.ngModel = { shape: null };
    $parentScope.schema = {
      label: 'Shape',
      choices: [choice1, choice2],
      type: 'choice',
      read_only: true
    };

    var element = digest(html);

    expect(element.find('select').attr('readonly')).to.equal('readonly');
  });
});
