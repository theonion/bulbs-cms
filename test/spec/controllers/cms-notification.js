'use strict';

describe('Controller: CmsNotificationCtrl', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var CmsNotificationCtrl,
      $httpBackend,
      $scope;

  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, CmsNotificationsApi, moment, mockApiData) {

    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();

    $httpBackend.expectGET('/cms/api/v1/cms_notifications/').respond(mockApiData.cmsNotifications);

    CmsNotificationsApi.getList().then(function (cmsNotifications) {
      $scope.cmsNotifications = cmsNotifications;
      $scope.cmsNotification = $scope.cmsNotifications[0];
    });

    $httpBackend.flush();

    CmsNotificationCtrl = $controller('CmsNotificationCtrl', {
      $scope: $scope,
      moment: moment,
      CmsNotificationsApi: CmsNotificationsApi
    });

    sinon.spy($scope.cmsNotification, 'put');
    sinon.spy($scope.cmsNotification, 'remove');
    sinon.spy($scope.cmsNotifications, 'post');

    $scope.cmsNotificationDirty = false;

    $scope.$parent.userIsSuperuser = true;

  }));

  it('should have a scope level variable to track if a notification is dirty', function () {

    expect($scope.cmsNotificationDirty).to.equal(false);

    // start watch
    $scope.$apply();
    // make mod
    $scope.cmsNotification.title = 'Some New Title';
    // fire watch again, which should recognize the change now
    $scope.$apply();

    expect($scope.cmsNotificationDirty).to.equal(true);

  });

  describe('save and delete functions', function () {

    // set up mock save and deletes for this block of tests
    beforeEach(inject(function ($q) {
      $scope.$parent.$saveCmsNotification = function () {
        var saveDefer = $q.defer(),
            savePromise = saveDefer.promise;
        saveDefer.resolve({});
        return savePromise;
      };
      $scope.$parent.$deleteCmsNotification = function () {
        var deleteDefer = $q.defer(),
            deletePromise = deleteDefer.promise;
        deleteDefer.resolve();
        return deletePromise;
      };

      sinon.spy($scope.$parent, '$saveCmsNotification');
      sinon.spy($scope.$parent, '$deleteCmsNotification');

    }));

    it('should not be able to save if no changes have been made', function () {

      $scope.saveCmsNotification();
      $scope.$apply();

      expect($scope.$parent.$saveCmsNotification).not.to.have.been.called;

    });

    it('should have a function to save itself using the parent scope\'s save function', function () {

      $scope.cmsNotificationDirty = true;

      $scope.saveCmsNotification();
      $scope.$apply();

      expect($scope.$parent.$saveCmsNotification).to.have.been.called;
      expect($scope.cmsNotificationDirty).to.equal(false);

    });

    it('should have a function to delete itself using the parent scope\'s remove function', function () {

      $scope.deleteCmsNotification();

      expect($scope.$parent.$deleteCmsNotification).to.have.been.called;

    });

    it('should not be able to save or delete if not superuser', function () {

      $scope.$parent.userIsSuperuser = false;

      $scope.cmsNotification.editable = false;
      $scope.cmsNotificationDirty = true;
      $scope.cmsNotificationValid = true;

      $scope.saveCmsNotification();
      $scope.deleteCmsNotification();
      $scope.$apply();

      expect($scope.$parent.$saveCmsNotification).not.to.have.been.called;
      expect($scope.$parent.$deleteCmsNotification).not.to.have.been.called;

    });

  });

});
