'use strict';

describe('Controller: PromotionCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var $httpBackend, $rootScope, PromotionCtrl, Contentlist, scope, options;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, promo_options, mockApiData) {
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
    Contentlist = $injector.get('Contentlist');
    options = promo_options;
    scope = $rootScope.$new();
    PromotionCtrl = $controller('PromotionCtrl', {
      $scope: scope
    });
    scope.promotedArticles = [{id: 0}, {id: 1}, {id: 2}];
  }));

  it('should get pzones and content when the views load', function() {
    spyOn(scope, 'getPzones');
    spyOn(Contentlist, 'getContent');
    $rootScope.$broadcast("$viewContentLoaded");
    expect(scope.getPzones).toHaveBeenCalledWith(options.endpoint);
    expect(Contentlist.getContent).toHaveBeenCalled();
  });

  describe('getPzones', function () {

    it('should get the pzones and the promoted articles', function () {
      $httpBackend.expect('GET', '/foo/bar/').respond({
        results: [{
          content: [{
            title: 'blah'
          }]
        }]
      });

      scope.$apply(function () {
        scope.getPzones('/foo/bar/');
      })

      $httpBackend.flush();

      expect(scope.pzones.length).toBeGreaterThan(0);
      expect(scope.pzone).toBeDefined();
      expect(scope.promotedArticles.length).toBeGreaterThan(0);
    });

  });

  describe('articleIsInPromotedArticles', function () {
    it('should check if the article is promoted or not', function() {
      var not_there = scope.articleIsInPromotedArticles(3);
      var there = scope.articleIsInPromotedArticles(0);
      expect(not_there).toBe(false);
      expect(there).toBe(true);
    });

  });

  describe('insertArticle', function() {

    it('should insert the article into an empty slot', function() {
      scope.promotedArticles = [];
      scope.pzone = {name: 'blah', id:1, content: [{title:"some data"}]};
      scope.selectedArticle = {id: 'holler'};
      scope.insertArticle(0);
      expect(scope.promotedArticles[0].id).toBe('holler');
    });

    it('should insert the article at a specific index', function() {
      scope.pzone = {name: 'blah', id:1, content: [{title:"some data"}]};
      scope.selectedArticle = {id: 'holler'};
      scope.insertArticle(1);
      expect(scope.promotedArticles[1].id).toBe('holler');
    });

  });

  describe('replaceArticle', function() {

    it('should replace the promoted article', function() {
      scope.selectedArticle = {id: 'holler'};
      scope.replaceArticle(1);
      expect(scope.promotedArticles[1].id).toBe('holler');
    });

  });

  describe('save', function() {

    it('should send a PUT request to the contentlist endpoint', function() {
      var data = {name: 'blah', id:1, content: [{title:"some data"}]};
      scope.pzone = data;
      scope.promotedArticles = data.content;
      $httpBackend.expect('PUT', options.endpoint + data.id + '/').respond(data.content);
      scope.save();
      $httpBackend.flush();
    });

  });

  describe('moveUp', function () {

    it('should not move at all if the promoted article is on the top', function() {
      scope.moveUp(0);
      expect(scope.promotedArticles[0].id).toBe(0);
      expect(scope.promotedArticles[1].id).toBe(1);
      expect(scope.promotedArticles[2].id).toBe(2);
    });

    it('should move the promoted article up one row', function() {
      scope.moveUp(1);
      expect(scope.promotedArticles[0].id).toBe(1);
      expect(scope.promotedArticles[1].id).toBe(0);
      expect(scope.promotedArticles[2].id).toBe(2);
    });

  });
  describe('moveDown', function () {

    it('should not move at all if the promoted article is on the bottom', function() {
      scope.moveDown(2);
      expect(scope.promotedArticles[0].id).toBe(0);
      expect(scope.promotedArticles[1].id).toBe(1);
      expect(scope.promotedArticles[2].id).toBe(2);
    });

    it('should move the promoted article down one row', function() {
      scope.moveDown(1);
      expect(scope.promotedArticles[0].id).toBe(0);
      expect(scope.promotedArticles[1].id).toBe(2);
      expect(scope.promotedArticles[2].id).toBe(1);
    });

  });

  describe('remove', function () {

    it('should remove the promoted article', function() {
      scope.remove(0);
      expect(scope.promotedArticles[0].id).toBe(1);
      expect(scope.promotedArticles[1].id).toBe(2);
      expect(scope.promotedArticles.length).toBe(2);
    });

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  })

});
