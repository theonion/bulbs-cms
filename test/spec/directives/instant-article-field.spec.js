describe('InstantArticleField directive', function() {
  var scope, element, directiveScope;

  beforeEach(angular.mock.module('jsTemplates'));
  beforeEach(angular.mock.module('instantArticleField'));

  beforeEach(angular.mock.inject(function($rootScope, $compile, $httpBackend, $templateCache, InstantArticleConfig) {
    scope = $rootScope.$new();
    scope.content = {
      instant_article: false,
      feature_type: 'News in Brief'
    };

    InstantArticleConfig.setSupportedFeatureTypes(['News in Brief']);

    element = $compile('<instant-article-field content="content"></instant-article-field>')(scope);
    scope.$digest();
    directiveScope = element.isolateScope();
  }));

  describe('#setActive', function() {
    it('sets instant_article to true', function() {
      element.find('.active.item-toggle').trigger('click');
      expect(scope.content.instant_article).toBe(true);
    });
  });

  describe('#setInactive', function() {
    it('sets instant_article to false', function() {
      element.find('.inactive.item-toggle').trigger('click');
      expect(scope.content.instant_article).toBe(false);
    });
  });

  describe('#initInstantArticleEnabled', function() {
    it('sets instantArticleEnabled to true if feature type supported', function() {
      directiveScope.initInstantArticleEnabled();
      expect(directiveScope.instantArticleEnabled).toBe(true);
    });
  });
});
