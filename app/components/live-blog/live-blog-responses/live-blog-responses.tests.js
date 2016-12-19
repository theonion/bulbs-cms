'use strict';

describe('Directive: liveBlogResponses', function () {
  var $parentScope;
  var digest;
  var entry;
  var html;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.liveBlog.responses');
    module('jsTemplates');

    html = angular.element('<live-blog-responses entry="entry"></live-blog-responses>');
    $parentScope.entry = entry = {};

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

  // TODO : fill this in
});

