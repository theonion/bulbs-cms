'use strict';

describe('Controller: LastmodifiedguardmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  var LastmodifiedguardmodalCtrl,
    scope,
    httpBackend,
    lastSavedBy,
    modalService,
    modal,
    routeService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $httpBackend, routes, $modal, $route) {
    lastSavedBy = {id: 1, username: 'whatever'};

    routeService = $route;

    var modalUrl = routes.PARTIALS_URL + 'modals/last-modified-guard-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    })

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }

    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.expectGET('/cms/api/v1/log/?content=1').respond([
      {user: 1, action_time: '1999-04-08T15:35:15.118Z'},
      {user: 2, action_time: '1998-04-08T15:35:15.118Z'},
      {user: 3, action_time: '1997-04-08T15:35:15.118Z'},
      {user: 4, action_time: '1996-04-08T15:35:15.118Z'},
      {user: 5, action_time: '1995-04-08T15:35:15.118Z'},
    ]);
    httpBackend.expectGET('/cms/api/v1/author/1/').respond(lastSavedBy);

    scope.article = {
      id: 1,
      title: 'This is Mine'
    };
    scope.articleIsDirty = false;

    LastmodifiedguardmodalCtrl = $controller('LastmodifiedguardmodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      articleOnPage: scope.article,
      articleOnServer: {
        title: 'This is Theirs'
      }
    });
    scope.$digest();
    httpBackend.flush();
  }));

  afterEach (function () {
    httpBackend.verifyNoOutstandingExpectation ();
    httpBackend.verifyNoOutstandingRequest ();
  });

  it('should have property lastSavedBy for user that last saved article', function () {
    expect(scope.lastSavedBy.id).toBe(lastSavedBy.id);
    expect(scope.lastSavedBy.username).toBe(lastSavedBy.username);
  });

  it('should have a function loadFromServer that replaces current article with latest version', function () {

    expect(scope.article.title).toBe('This is Mine');
    expect(scope.articleIsDirty).toBe(false);

    scope.loadFromServer();

    expect(scope.article.title).toBe('This is Theirs');
    expect(scope.articleIsDirty).toBe(true);

  });

  it('should have a function saveAnyway that calls $parent.postValidationSaveArticle', function (){
    scope.$parent = {};
    scope.$parent.postValidationSaveArticle = function(){};
    spyOn(scope.$parent, 'postValidationSaveArticle');
    scope.saveAnyway();
    expect(scope.$parent.postValidationSaveArticle).toHaveBeenCalled();
  });

});
