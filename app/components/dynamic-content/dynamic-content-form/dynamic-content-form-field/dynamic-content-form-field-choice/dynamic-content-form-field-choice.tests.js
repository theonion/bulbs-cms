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
});
