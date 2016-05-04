'use strict';

describe('Controller: ContenteditCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var ContenteditCtrl,
    controller,
    scope,
    httpBackend,
    routeParams,
    mockArticle,
    contentApi,
    VersionStorageApiMock,
    modalService;

  var contentApiUrl = '/cms/api/v1/content/1/';

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, _$routeParams_, mockApiData, ContentFactory, $modal) {
    controller = $controller;
    mockArticle = mockApiData['content.list'].results[0];
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    routeParams = _$routeParams_;
    routeParams.id = 1;
    contentApi = ContentFactory;
    modalService = $modal;

    VersionStorageApiMock = {
      $create: function() {
        return true;
      }
    };

    sinon.stub(VersionStorageApiMock, '$create');

  }));

  describe('on instantiation', function () {
    it('should retrieve the current article from the API', function () {
      sinon.spy(contentApi, 'one');
      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: routeParams,
        ContentApi: contentApi
      });
      expect(contentApi.one.calledWith('content', 1)).to.equal(true);
    });
  });

  describe('after instantion', function () {
    beforeEach(function () {
      httpBackend.expectGET(contentApiUrl).respond(mockArticle);
      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: routeParams,
        VersionStorageApi: VersionStorageApiMock,
        $modal: modalService
      });
      scope.$digest();
      httpBackend.flush();
    });

    afterEach (function () {
      httpBackend.verifyNoOutstandingExpectation ();
      httpBackend.verifyNoOutstandingRequest ();
    });

    it('should have string CONTENT_PARTIALS_URL in scope', function () {
      expect(typeof scope.CONTENT_PARTIALS_URL).to.equal('string');
    });

    it('should have string MEDIA_ITEM_PARTIALS_URL in scope', function () {
      expect(typeof scope.MEDIA_ITEM_PARTIALS_URL).to.equal('string');
    });

    it('should have string CACHEBUSTER in scope', function () {
      expect(typeof scope.CACHEBUSTER).to.equal('string');
    });

    it('should have a saveArticle function in scope', function () {
      expect(scope.saveArticle).not.to.be.undefined;
    });

    it('should set articleIsDirty to true when article is dirty', function () {
      scope.article.title = 'some random title that isn not the same as the original';
      scope.$digest();
      expect(scope.articleIsDirty).to.equal(true);
    });

    describe('function: saveArticleIfDirty', function () {
      it('should call saveArticle if article is dirty', function () {
        scope.articleIsDirty = true;
        sinon.stub(scope, 'saveArticle');
        scope.saveArticleIfDirty();
        expect(scope.saveArticle.called).to.equal(true);
      });

      it('should not call saveArticle if article is not dirty', function () {
        scope.articleIsDirty = false;
        sinon.stub(scope, 'saveArticle');
        scope.saveArticleIfDirty();
        expect(scope.saveArticle.called).to.equal(false);
      });
    });

    describe('function: saveArticle', function () {

      it('should call postValidationSaveArticle and create a version if no last_modified discrepancy', function () {
        httpBackend.expect('GET', '/cms/api/v1/content/1/').respond(mockArticle);
        httpBackend.expect('PUT', '/cms/api/v1/content/1/').respond(mockArticle);

        sinon.spy(scope, 'postValidationSaveArticle');

        scope.saveArticle();
        httpBackend.flush();

        expect(scope.postValidationSaveArticle.called).to.equal(true);
        expect(VersionStorageApiMock.$create.called).to.equal(true);
      });

      it('should open a modal if there is a last modified conflict', function () {
        var newMockArticle = angular.copy(mockArticle);
        newMockArticle.last_modified = '2999-04-08T15:35:15.118Z'; //last_modified FAR in the future
        httpBackend.expect('GET', '/cms/api/v1/content/1/').respond(newMockArticle);
        sinon.stub(scope, 'postValidationSaveArticle');
        sinon.stub(modalService, 'open');
        scope.saveArticle();
        httpBackend.flush();
        expect(modalService.open.called).to.equal(true);
        expect(scope.postValidationSaveArticle.called).to.equal(false);
      });
    });
  });
});
