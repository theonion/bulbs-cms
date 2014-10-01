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

    $httpBackend.expectGET('/cms/api/v1/notifications/').respond(mockApiData.notifications);

    CmsNotificationsApi.getList().then(function (notifications) {
      $scope.notifications = notifications;
      $scope.notification = $scope.notifications[0];
    });

    $httpBackend.flush();

    CmsNotificationCtrl = $controller('CmsNotificationCtrl', {
      $scope: $scope,
      moment: moment,
      CmsNotificationsApi: CmsNotificationsApi
    });

    spyOn($scope.notification, 'put').andCallThrough();
    spyOn($scope.notification, 'remove').andCallThrough();
    spyOn($scope.notifications, 'post').andCallThrough();

    $scope.notificationDirty = false;

  }));

  it('should have a scope level variable to track if a notification is dirty', function () {

    expect($scope.notificationDirty).toBe(false);

    // start watch
    $scope.$apply();
    // make mod
    $scope.notification.title = 'Some New Title';
    // fire watch again, which should recognize the change now
    $scope.$apply();

    expect($scope.notificationDirty).toBe(true);

  });

  describe('save and delete functions', function () {

    // set up mock save and deletes for this block of tests
    beforeEach(inject(function ($q) {
      $scope.$parent.$saveNotification = function () {
        var saveDefer = $q.defer(),
            savePromise = saveDefer.promise;
        saveDefer.resolve({});
        return savePromise;
      };
      $scope.$parent.$deleteNotification = function () {
        var deleteDefer = $q.defer(),
            deletePromise = deleteDefer.promise;
        deleteDefer.resolve();
        return deletePromise;
      };

      spyOn($scope.$parent, '$saveNotification').andCallThrough();
      spyOn($scope.$parent, '$deleteNotification').andCallThrough();

    }));

    it('should not be able to save if no changes have been made', function () {

      $scope.saveNotification();
      $scope.$apply();

      expect($scope.$parent.$saveNotification).not.toHaveBeenCalled();

    });

    it('should have a function to save itself using the parent scope\'s save function', function () {

      $scope.notificationDirty = true;

      $scope.saveNotification();
      $scope.$apply();

      expect($scope.$parent.$saveNotification).toHaveBeenCalled();
      expect($scope.notificationDirty).toBe(false);

    });

    it('should have a function to delete itself using the parent scope\'s remove function', function () {

      $scope.deleteNotification();

      expect($scope.$parent.$deleteNotification).toHaveBeenCalled();

    });

  });

});
