'use strict';

describe('', function () {
  var $parentScope;
  var $q;
  var digest;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'hideFromRssField',
      function ($compileProvider) {
        window.testHelper.directiveMock($compileProvider, 'hideFromRssField');
      }
    );

    inject(function (_$q_, $compile, $rootScope) {
      $parentScope = $rootScope.$new();
      $q = _$q_;

      $parentScope.article = {
        id: 1,
        title: 'My Garbage Title',
        hide_from_rss: true
      };

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should set to true if model is set to true', function () {

  });

});
