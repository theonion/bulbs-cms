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

    spyOn(InstantArticleConfig, 'getSupportedFeatureTypes').andReturn(['News in Brief']);

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

  it('sets the instant article enabled to true if feature type supported', function() {
    expect(directiveScope.instantArticleEnabled).toBe(true);
  });

  describe('not allowed feature type', function() {
    beforeEach(angular.mock.inject(function($rootScope, $compile, $httpBackend, $templateCache, InstantArticleConfig) {
      scope = $rootScope.$new();
      scope.content = {
        instant_article: false,
        feature_type: 'TV Club'
      };

      element = $compile('<instant-article-field content="content"></instant-article-field>')(scope);
      scope.$digest();
      directiveScope = element.isolateScope();
    }));

    it('sets instant article enabled to false if feature type not supported', function() {
      expect(directiveScope.instantArticleEnabled).toBe(false);
    });
  });
});
