'use strict';

describe('Controller: ContenteditCtrl', function () {

  var $location;
  var contentApi;
  var contentApiUrl = '/cms/api/v1/content/1/';
  var ContenteditCtrl;
  var controller;
  var httpBackend;
  var mockArticle;
  var modalService;
  var sandbox;
  var scope;
  var VersionStorageApiMock;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbsCmsApp');
    module('bulbsCmsApp.mockApi');

    inject(function (_$location_, $controller, $rootScope, $httpBackend,
        mockApiData, ContentFactory, $modal) {

      $location = _$location_;
      controller = $controller;
      mockArticle = mockApiData['content.list'].results[0];
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
      contentApi = ContentFactory;
      modalService = $modal;

      VersionStorageApiMock = {
        $create: function() {
          return true;
        }
      };

      sandbox.stub(VersionStorageApiMock, '$create');
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('on instantiation', function () {

    it('should retrieve the current article from the API', function () {
      sandbox.spy(contentApi, 'one');

      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: { id: 1 },
        ContentApi: contentApi
      });

      expect(contentApi.one.withArgs('content', 1).callCount).to.equal(1);
    });

    it('should not retrieve the current article if given id is `new`', function () {
      sandbox.spy(contentApi, 'one');

      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: { id: 'new' },
        ContentApi: contentApi
      });

      expect(contentApi.one.withArgs('content').callCount).to.equal(0);
    });

    it('should read article_type param from url when given id `new`', function () {
      var contentType = 'my_article_type';

      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: {
          id: 'new',
          contentType: contentType
        },
        ContentApi: contentApi
      });

      expect(scope.article.polymorphic_ctype).to.equal(contentType);
    });

    it('should mark article as dirty if given id is `new`', function () {
      sandbox.spy(contentApi, 'one');

      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: { id: 'new' },
        ContentApi: contentApi
      });

      expect(scope.articleIsDirty).to.equal(true);
    });
  });

  describe('after instantion', function () {

    it('should have a saveArticle function in scope', function () {
      httpBackend.expectGET(contentApiUrl).respond(mockArticle);
      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: { id: 1 },
        VersionStorageApi: VersionStorageApiMock,
        $modal: modalService
      });
      scope.$digest();
      httpBackend.flush();

      expect(scope.saveArticle).not.to.be.undefined;
    });

    it('should set articleIsDirty to true when article is dirty', function () {
      httpBackend.expectGET(contentApiUrl).respond(mockArticle);
      ContenteditCtrl = controller('ContenteditCtrl', {
        $scope: scope,
        $routeParams: { id: 1 },
        VersionStorageApi: VersionStorageApiMock,
        $modal: modalService
      });
      scope.$digest();
      httpBackend.flush();

      scope.article.title = 'some random title that isn not the same as the original';
      scope.$digest();

      expect(scope.articleIsDirty).to.equal(true);
    });

    describe('function: saveArticleIfDirty', function () {
      it('should call saveArticle if article is dirty', function () {
        httpBackend.expectGET(contentApiUrl).respond(mockArticle);
        ContenteditCtrl = controller('ContenteditCtrl', {
          $scope: scope,
          $routeParams: { id: 1 },
          VersionStorageApi: VersionStorageApiMock,
          $modal: modalService
        });
        scope.$digest();
        httpBackend.flush();

        scope.articleIsDirty = true;
        sandbox.stub(scope, 'saveArticle');
        scope.saveArticleIfDirty();

        expect(scope.saveArticle).to.have.been.called;
      });

      it('should not call saveArticle if article is not dirty', function () {
        httpBackend.expectGET(contentApiUrl).respond(mockArticle);
        ContenteditCtrl = controller('ContenteditCtrl', {
          $scope: scope,
          $routeParams: { id: 1 },
          VersionStorageApi: VersionStorageApiMock,
          $modal: modalService
        });
        scope.$digest();
        httpBackend.flush();

        scope.articleIsDirty = false;
        sandbox.stub(scope, 'saveArticle');
        scope.saveArticleIfDirty();

        expect(scope.saveArticle).not.to.have.been.called;
      });
    });

    describe('function: saveArticle', function () {

      it('should call postValidationSaveArticle and create a version if no last_modified discrepancy', function () {
        httpBackend.expectGET(contentApiUrl).respond(mockArticle);
        ContenteditCtrl = controller('ContenteditCtrl', {
          $scope: scope,
          $routeParams: { id: 1 },
          VersionStorageApi: VersionStorageApiMock,
          $modal: modalService
        });
        scope.$digest();
        httpBackend.flush();
        httpBackend.expect('GET', '/cms/api/v1/content/1/').respond(mockArticle);
        httpBackend.expect('PUT', '/cms/api/v1/content/1/').respond(mockArticle);
        sandbox.spy(scope, 'postValidationSaveArticle');

        scope.saveArticle();
        httpBackend.flush();

        expect(scope.postValidationSaveArticle).to.have.been.called;
        expect(VersionStorageApiMock.$create).to.have.been.called;
      });

      it('should open a modal if there is a last modified conflict', function () {
        httpBackend.expectGET(contentApiUrl).respond(mockArticle);
        ContenteditCtrl = controller('ContenteditCtrl', {
          $scope: scope,
          $routeParams: { id: 1 },
          VersionStorageApi: VersionStorageApiMock,
          $modal: modalService
        });
        scope.$digest();
        httpBackend.flush();
        var newMockArticle = angular.copy(mockArticle);
        newMockArticle.last_modified = '2999-04-08T15:35:15.118Z'; //last_modified FAR in the future
        httpBackend.expect('GET', '/cms/api/v1/content/1/').respond(newMockArticle);
        sandbox.stub(scope, 'postValidationSaveArticle');
        sandbox.stub(modalService, 'open');

        scope.saveArticle();
        httpBackend.flush();

        expect(modalService.open).to.have.been.called;
        expect(scope.postValidationSaveArticle).not.to.have.been.called;
      });

      it('should save with a doctype when creating a new article', function () {
        var doctype = 'some_doctype';
        ContenteditCtrl = controller('ContenteditCtrl', {
          $scope: scope,
          $routeParams: {
            id: 'new',
            polymorphic_ctype: doctype
          },
          VersionStorageApi: VersionStorageApiMock,
          $modal: modalService
        });
        scope.$digest();
        window.onbeforeunload = function () {};
        sandbox.spy(scope.article, 'save').withArgs(sinon.match({ doctype: doctype }));

        scope.saveArticle();

        expect(scope.article.save.callCount).to.equal(1);
      });

      it('should switch current route to created aritcle IDed route', function () {
        var contentType = 'my_content_type';
        httpBackend.expect('POST', '/cms/api/v1/content/?doctype='+ contentType).respond(mockArticle);
        ContenteditCtrl = controller('ContenteditCtrl', {
          $scope: scope,
          $routeParams: {
            id: 'new',
            contentType: contentType
          },
          VersionStorageApi: VersionStorageApiMock,
          $modal: modalService
        });
        scope.$digest();
        window.onbeforeunload = function () {};
        sandbox.stub($location, 'path');

        scope.saveArticle();
        httpBackend.flush();

        expect($location.path).to.have.been
          .calledWith('/cms/app/edit/' + scope.article.id + '/' + contentType);
      });
    });
  });
});
