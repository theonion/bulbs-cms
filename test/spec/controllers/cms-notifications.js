'use strict';

describe('Controller: CmsNotificationsCtrl', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var CmsNotificationsCtrl,
      ContentApi,
      $rootScope,
      $scope,
      $httpBackend;

  beforeEach(inject(function (_$rootScope_, $controller, _$httpBackend_, _ContentApi_, $window, routes, mockApiData) {

    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    ContentApi = _ContentApi_;

    $httpBackend.expectGET('/cms/api/v1/notifications/').respond(mockApiData.notifications);

    CmsNotificationsCtrl = $controller('CmsNotificationsCtrl', {
      $window: $window,
      $scope: $scope,
      routes: routes,
      ContentApi: ContentApi
    });

    $httpBackend.flush();
    $rootScope.$apply();

  }));

  it('should initialize with notifications from backend, transforming dates to moment objects', function () {

    expect($scope.notifications[0].title).toBe('We\'ve Made An Update!');
    expect(moment.isMoment($scope.notifications[0].post_date)).toBe(true);
    expect(moment.isMoment($scope.notifications[0].notify_end_date)).toBe(true);

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

});