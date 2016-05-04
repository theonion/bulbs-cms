'use strict';

describe('Controller: ContentlistCtrl', function () {

  var
    ContentlistCtrl,
    ContentListService,
    $scope,
    $httpBackend,
    mockArticleList,
    locationService;

  // Initialize the controller and a mock scope
  beforeEach(function () {
    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');

    inject(function ($controller, $rootScope, _$httpBackend_, mockApiData, _$location_, _ContentListService_) {
      $scope = $rootScope.$new();
      locationService = _$location_;
      mockArticleList = mockApiData['content.list'];
      $httpBackend = _$httpBackend_;
      ContentListService = _ContentListService_;

      // setup content list controller
      sinon.stub(_ContentListService_, '$updateContent', function () {
        return {
          then: function (func) {
            func({
              content: mockArticleList.results,
              totalItems: mockArticleList.results.length
            });
          }
        };
      });
      ContentlistCtrl = $controller('ContentlistCtrl', {
        $scope: $scope,
        $location: locationService,
        ContentListService: ContentListService
      });
      expect(ContentListService.$updateContent.called).to.equal(true);
    });
  });

  it('should attach list of articles to scope', function () {
    expect($scope.contentData.content.length).to.equal(mockArticleList.results.length);
  });

  it('should have function to change pages', function () {
    expect(ContentListService.$updateContent.called).to.equal(true);
  });

});
