'use strict';

describe('Directive: superFeaturesEdit', function () {
  var $parentScope;
  var $q;
  var digest;
  var sandbox;
  var SuperFeaturesApi;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.superFeatures.edit',
      function ($compileProvider) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentForm');
        window.testHelper.directiveMock($compileProvider, 'superFeaturesRelations');
      }
    );
    module('jsTemplates');

    inject(function (_$q_, _SuperFeaturesApi_, $compile, $rootScope) {
      $parentScope = $rootScope.$new();
      $q = _$q_;
      SuperFeaturesApi = _SuperFeaturesApi_;

      $parentScope.article = {
        id: 1,
        title: 'My Garbage Title'
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

  context('breadcrumbs', function () {

    it('should list super feature list page as first element', function () {

      var element = digest('<super-features-edit></super-features-edit>');

      var crumb = element.scope().breadcrumbs[0];
      expect(crumb.label).to.equal('Super Features');
      expect(crumb.href).to.equal('/cms/app/super-features');
    });

    it('should gather all parents and list them in the middle', function () {
      var parentArticle1 = {
        id: 1,
        title: 'Article 1'
      };
      var parentArticle2 = {
        id: 2,
        title: 'Article 2',
        parent: parentArticle1.id
      };
      $parentScope.article = {
        id: 3,
        parent: parentArticle2.id
      };
      var request1 = $q.defer();
      var request2 = $q.defer();
      var getSuperFeature = sandbox.stub(SuperFeaturesApi, 'getSuperFeature');
      getSuperFeature.withArgs(parentArticle2.id).returns(request1.promise);
      getSuperFeature.withArgs(parentArticle1.id).returns(request2.promise);
      var element = digest('<super-features-edit></super-features-edit>');
      var scope = element.scope();

      request1.resolve(parentArticle2);
      request2.resolve(parentArticle1);
      scope.$digest();

      var breadcrumbs = element.scope().breadcrumbs;
      expect(breadcrumbs.length).to.equal(4);
      expect(breadcrumbs[1].label).to.equal(parentArticle1.title);
      expect(breadcrumbs[2].label).to.equal(parentArticle2.title);
    });

    it('should list the current article title as the last element', function () {
      var element = digest('<super-features-edit></super-features-edit>');

      var breadcrumbs = element.scope().breadcrumbs;
      var crumb = breadcrumbs[breadcrumbs.length - 1];
      expect(crumb.label()).to.equal($parentScope.article.title);
    });
  });
});