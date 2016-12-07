'use strict';

describe('Directive: dynamicContentFormFieldContentReference', function () {
  var $parentScope;
  var digest;
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.contentReferences');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      html = (
        '<form name="testForm">' +
          '<dynamic-content-form-field-content-references ' +
              'name="{{ name }}" ' +
              'ng-model="ngModel" ' +
              'schema="schema" ' +
              '>' +
          '</dynamic-content-form-field-content-references>' +
        '</form>'
      );

      $parentScope.name = 'references';
      $parentScope.ngModel = {};
      $parentScope.schema = {};

      $parentScope.ngModel[$parentScope.name] = [];

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a recirc chooser with', function () {

    var element = digest(html);

    expect(element.find('recirc-chooser').length).to.equal(1);
  });

  it('should recirc chooser should take maximum from schema max_size', function () {
    var maxSize = 10;
    $parentScope.schema = {
      max_size: maxSize
    };

    var element = digest(html);
    var recircChooserElement = element.find('recirc-chooser');

    expect(recircChooserElement.attr('max-recirc-items')).to.equal('' + maxSize);
  });
});

