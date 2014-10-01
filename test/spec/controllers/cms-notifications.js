'use strict';

describe('Controller: CmsNotificationsCtrl', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var CmsNotificationsCtrl,
      $httpBackend,
      $scope;

  beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, CmsNotificationsApi, $window, routes,
                              mockApiData) {

    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();

    $httpBackend.expectGET('/cms/api/v1/notifications/').respond(mockApiData.notifications);

    CmsNotificationsCtrl = $controller('CmsNotificationsCtrl', {
      $window: $window,
      $scope: $scope,
      routes: routes,
      CmsNotificationsApi: CmsNotificationsApi
    });

    $httpBackend.flush();
    $rootScope.$apply();

  }));

  it('should initialize with notifications from backend', function () {

    expect($scope.notifications[0].title).toBe('We\'ve Made An Update!');

  });

  it('should provide a function to add new notifications to top of notifications list', function () {

    var prevLength = $scope.notifications.length;

    $scope.newNotification();

    var newLength = $scope.notifications.length,
        newNotification = $scope.notifications[0];

    expect(newLength).toBe(prevLength + 1);

    // we only care about ensuring that there's no post / notify end date for new posts
    expect(newNotification.post_date).toBe(null);
    expect(newNotification.notify_end_date).toBe(null);

  });

  it('should provide a function to save a notification', function () {

    var notificationToSave = $scope.newNotification(),
        newPostDate = moment('2014-09-25T16:00:00-0500'),
        newNotifyEndDate = moment('2014-09-28T16:00:00-0500');

    notificationToSave.title = 'A New Notification';
    notificationToSave.body = 'Whatever balhb alhblahb.';
    notificationToSave.post_date = newPostDate;
    notificationToSave.notify_end_date = newNotifyEndDate;

    $httpBackend.expectPOST('/cms/api/v1/notifications/').respond(200, notificationToSave);

    var notificationSaved = null;
    $scope.$saveNotification(notificationToSave).then(function (notification) {
      notificationSaved = notification;
    });

    $httpBackend.flush();
    $scope.$apply();

    expect(notificationSaved.getRestangularUrl).toBeDefined();
    expect(notificationSaved.title).toBe(notificationToSave.title);
    expect(notificationSaved.post_date.valueOf()).toBe(newPostDate.valueOf());
    expect(notificationSaved.notify_end_date.valueOf()).toBe(newNotifyEndDate.valueOf());

  });

  it('should provide a function to remove a notification', function () {

    var notificationToDelete = $scope.notifications[0],
        deleted = false,
        oldLength = $scope.notifications.length;

    $httpBackend.expectDELETE('/cms/api/v1/notifications/0/').respond(200);

    $scope.$deleteNotification(notificationToDelete).then(function () {
      deleted = true;
    });

    $httpBackend.flush();
    $scope.$apply();

    expect(deleted).toBe(true);
    expect($scope.notifications.length).toBe(oldLength - 1);

  });

});