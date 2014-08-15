'use strict';

describe('Controller: ContentlistCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var ContentlistCtrl,
    scope,
    httpBackend,
    mockArticleList,
    locationService;

  var contentApiUrl = '/cms/api/v1/content/';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, mockApiData, _$location_) {
    scope = $rootScope.$new();
    locationService = _$location_;
    mockArticleList = mockApiData['content.list'];
    httpBackend = $httpBackend;
    httpBackend.expectGET(contentApiUrl).respond(mockArticleList)
    ContentlistCtrl = $controller('ContentlistCtrl', {
      $scope: scope,
      $location: locationService
    });
    scope.$digest();
    httpBackend.flush();
  }));
  
  afterEach (function () {
    httpBackend.verifyNoOutstandingExpectation ();
    httpBackend.verifyNoOutstandingRequest ();
  });

  it('should attach list of articles to scope', function () {
    expect(scope.articles.length).toBe(mockArticleList.results.length);
  });  

  describe('function getContent', function () {
    it('should take an argument that sets URL search', function () {
      var params = {'key1': 'value1', 'key2': 'value2'}
      spyOn(locationService, 'search').andCallThrough();
      scope.getContent(params);
      expect(locationService.search).toHaveBeenCalledWith(params);
    });
    
    it('should take an optional second argument (boolean) that merges params argument into current params', function () {
      /*merge is useful mainly for modifying the page without modifying the rest of the search*/
      var currentSearch = {'key1': 'value1'};
      spyOn(locationService, 'search').andCallFake(function(args) {
        if(!args){ return currentSearch; }
        if(args){ currentSearch = args; }
      });
      scope.getContent({'key2': 'value2'}, true);
      expect(locationService.search).toHaveBeenCalledWith({'key1': 'value1', 'key2': 'value2'});
    });
    
  });
  
  describe('function goToPage', function () {
    it('should call getContent with current pageNumber', function () {
      spyOn(scope, 'getContent');
      scope.goToPage();
      expect(scope.getContent).toHaveBeenCalled();
    });
  });


});
