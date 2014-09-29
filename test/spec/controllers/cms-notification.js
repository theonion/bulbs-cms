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

  it('should have a scope level variable that contains current time', function () {

    expect($scope.today).toBeDefined();
    expect(moment.isMoment($scope.today)).toBe(true);

  });

  it('should have a function to save the state of the current notification', function () {

    expect($scope.notificationDirty).toBe(false);

    $scope.notification.title = 'Some New Title';
    $scope.$apply();

    expect($scope.notificationDirty).toBe(true);

    $scope.saveNotification();

    expect($scope.notification.put).toHaveBeenCalled();

  });

  it('should save notification with a new id if it\'s a new notification', function () {

    $httpBackend.expectPOST('/cms/api/v1/notifications/').respond(200, $scope.notifications.length + 1);

    var now = moment();
    $scope.notification =  {
      post_date: now,
      notify_end_date: now.add({day : 1})
    };
    $scope.$apply();

    expect($scope.notificationDirty).toBe(true);
    expect($scope.notification.id).toBeUndefined();

    $scope.saveNotification();
    $httpBackend.flush();

    expect($scope.notifications.post).toHaveBeenCalled();
    expect($scope.notificationDirty).toBe(false);
    expect($scope.notification.id).toBeDefined();

  });

  it('should have a function to delete the current notification', function () {

    $httpBackend.expectDELETE('/cms/api/v1/notifications/0/').respond(200);

    var notificationsLength = $scope.notifications.length;

    $scope.deleteNotification();
    $httpBackend.flush();

    expect($scope.notification.remove).toHaveBeenCalled();
    expect($scope.notifications.length).toBe(notificationsLength - 1);

  });

});
