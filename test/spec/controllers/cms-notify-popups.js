'use strict';

describe('Controller: CmsNotifyPopupsCtrl', function () {

  beforeEach(module('bulbsCmsApp'));
  beforeEach(module('bulbsCmsApp.mockApi'));

  it('should open a notify per notification', inject(
    function ($httpBackend, ipCookie, $controller, $rootScope, moment, CmsNotificationsApi, mockApiData) {

      var callCount = 0,
          PNotify = function () {
            callCount++;
          },
          $scope = $rootScope.$new();

      $httpBackend.expectGET('/cms/api/v1/notifications/').respond(mockApiData.notifications);

      $controller('CmsNotifyPopupsCtrl', {
        $scope: $scope,
        ipCookie: ipCookie,
        moment: moment,
        CmsNotificationsApi: CmsNotificationsApi,
        PNotify: PNotify
      });

      $httpBackend.flush();
      $scope.$apply();

      expect(callCount).toBe(4);

    })
  );

});
