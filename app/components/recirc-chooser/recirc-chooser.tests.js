'use strict';

describe('Directive: recircChooser', function () {

  var $httpBackend;
  var $parentScope;
  var CmsConfig;
  var digest;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.recircChooser');
    module('jsTemplates');

    inject(function (_$httpBackend_, _CmsConfig_, $compile, $rootScope) {

      $httpBackend = _$httpBackend_;
      $parentScope = $rootScope.new();
      CmsConfig = _CmsConfig_;

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('input label', function () {

    it('should allow a dynamic label value', function () {

      throw new Error('not implemented yet');
    });

    it('should have a default label value if none is provided', function () {

      throw new Error('not implemented yet');
    });
  });

  context('input id', function () {

    it('should be a dynamic property', function () {

      throw new Error('not implemented yet');
    });

    it('should default to a uuid', function () {

      throw new Error('not implemented yet');
    });
  });

  context('dealing with recirc', function () {

    it('should request for existing ids', function () {

      throw new Error('not implemented yet');
    });

    it('should allow adding new ones', function () {

      throw new Error('not implemented yet');
    });

    it('should allow removing existing ones', function () {j

      throw new Error('not implemented yet');
    });

    it('should only allow 3 items by default', function () {

      throw new Error('not implemented yet');
    });

    it('should allow a custom maximum number of items', function () {

      throw new Error('not implemented yet');
    });

    it('should allow an unbounded number of items', function () {

      throw new Error('not implemented yet');
    });
  });
});

