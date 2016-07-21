'use strict';

describe('Directive: dynamicContentFormFieldChoice', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.choice');
    module('jsTemplates');

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
    var choice2 = { display_name: 'Square', value: 0 };
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

  it('should work correctly', function () {
// NOTE: put in a test here about the display of the selection being correct


    // TODO : add test code here
    throw new Error('Not implemented yet.');
  });
});
