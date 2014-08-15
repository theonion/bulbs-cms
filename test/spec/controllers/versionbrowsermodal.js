'use strict';

describe('Controller: VersionbrowsermodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('jsTemplates'));

  var VersionbrowsermodalCtrl,
    scope,
    windowService,
    modalService,
    modal;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $window, $modal, routes) {
    scope = $rootScope.$new();
    
    windowService = {};
    windowService.localStorage = {
      'articleBodyBackup.1.1.body': 'body at 1000',
      'articleBodyBackup.2.1.body': 'body at 2000',
      'articleBodyBackup.3.1.body': 'body at 3000',
      'articleBodyBackup.4.1.body': 'body at 4000',
      'somethingElse': 'whatever!!!'
    }
    
    var modalUrl = routes.PARTIALS_URL + 'modals/version-browser-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    });

    modal.dismiss = function () { return true; }
    modal.close = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }
    
    VersionbrowsermodalCtrl = $controller('VersionbrowsermodalCtrl', {
      $scope: scope,
      $modal: modalService,
      $modalInstance: modal,
      article: {id: 1},
      $window: windowService
    });
    scope.$digest();
  }));
  
  it('should have a scope property called timestamps which is a list of all the timestamps in localStorage', function () {
    expect(scope.timestamps).toEqual([4000,3000,2000,1000]);
  });
  
  it('should have a function preview that fetches HTML out of localStorage', function () {
    windowService.localStorage.getItem = function () {}
    spyOn(windowService.localStorage, 'getItem').andCallFake(function(key){
      return windowService.localStorage[key];
    });
    scope.preview(4000, {});
    expect(scope.versionPreview).toEqual('body at 4000');
  });
  
  it('should have a function restoreSelected that copies scope.versionPreview to scope.article.body', function () {
    scope.versionPreview = 'dummy value';
    scope.article = {body: 'other dummy value'};
    scope.restoreSelected();
    expect(scope.article.body).toBe('dummy value');
  });
  
  

});
