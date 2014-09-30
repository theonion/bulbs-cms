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

  it('should have a scope level variable to track if a notification is dirty', function () {

    expect($scope.notificationDirty).toBe(false);

    $scope.notification.title = 'Some New Title';
    $scope.$apply();

    expect($scope.notificationDirty).toBe(true);

  })

});
