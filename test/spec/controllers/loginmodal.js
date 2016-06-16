'use strict';

describe('Controller: LoginmodalCtrl', function () {

  // load the controller's module
  beforeEach(module('bulbsCmsApp'));

  var LoginmodalCtrl,
    scope,
    mockJquery,
    loginService,
    modalService,
    modal;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, Login, $modal) {
    loginService = Login;
    scope = $rootScope.$new();
    mockJquery = function () {
      return {
        val: function () { return 'bloop'; }
      }
    };

    var modalUrl = '/views/modals/login-modal.html';
    modal = $modal.open({
      templateUrl: modalUrl
    })

    modal.dismiss = function () { return true; }
    modalService = $modal
    modalService.open = function () { return true; }

    LoginmodalCtrl = $controller('LoginmodalCtrl', {
      $scope: scope,
      $: mockJquery,
      Login: loginService,
      $modal: modalService,
      $modalInstance: modal
    });
  }));

  it('should have a function login that calls Login.login with username/password', function (){
    sinon.stub(loginService, 'login').returns({then: function(){}});
    scope.login();
    expect(loginService.login).to.have.been.calledWith('bloop', 'bloop');
  });
});
