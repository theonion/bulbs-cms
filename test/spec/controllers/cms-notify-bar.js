'use strict';

describe('Controller: CmsNotifyBarCtrl', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));
  beforeEach(module('ipCookie'));

  var CmsNotifyBarCtrl,
      ipCookie,
      $httpBackend,
      $scope;

  beforeEach(inject(function (_$httpBackend_, _ipCookie_, $controller, $rootScope, moment, CmsNotificationsApi,
                              mockApiData) {

    ipCookie = _ipCookie_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();

    $httpBackend.expectGET('/cms/api/v1/notifications/').respond(mockApiData.notifications);

    CmsNotifyBarCtrl = $controller('CmsNotifyBarCtrl', {
      $scope: $scope,
      ipCookie: ipCookie,
      moment: moment,
      CmsNotificationsApi: CmsNotificationsApi
    });

    $httpBackend.flush();
    $scope.$apply();

  }));

  afterEach(function () {

    // clear up all cookies
    _.each(_.keys(ipCookie()), function (key) {
      ipCookie.remove(key);
    });

  });

  it('should contain a scope variable that has all visible notifications', function () {

    expect($scope.notifications.length).toBe(4);
//
  });

  it('should provide a way to dismiss notifications', function () {

    var notification = $scope.notifications[0];
    $scope.dismissNotification(notification);

    expect($scope.notifications.length).toBe(3);
    expect(ipCookie('dismissed-cms-notification-0')).toBe(true);

  });

});
