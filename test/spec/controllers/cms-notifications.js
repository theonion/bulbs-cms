'use strict';

describe('Controller: CmsNotificationsCtrl', function () {

  beforeEach(module('bulbsCmsApp', function (CmsConfigProvider) {
    CmsConfigProvider.setApiUrlRoot('/cms/api/v1/');
  }));
  beforeEach(module('bulbsCmsApp.mockApi'));

  var CmsNotificationsCtrl,
      $httpBackend,
      $scope;

  beforeEach(inject(function (_$httpBackend_, $rootScope) {

    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();

  }));

  describe('with editable notifications', function () {

    beforeEach(inject(function () {

      $httpBackend.expectGET('/cms/api/v1/me/').respond({
        id: 0,
        username: 'admin',
        email: 'webtech@theonion.com',
        first_name: 'Herman',
        last_name: 'Zweibel',
        is_superuser: true
      });

    }));

    beforeEach(inject(function ($rootScope, $controller, CmsNotificationsApi, $window,
                                mockApiData, CurrentUserApi) {

      $httpBackend.expectGET('/cms/api/v1/cms_notifications/').respond(mockApiData.cmsNotifications);

      CmsNotificationsCtrl = $controller('CmsNotificationsCtrl', {
        $window: $window,
        $scope: $scope,
        CmsNotificationsApi: CmsNotificationsApi,
        CurrentUserApi: CurrentUserApi
      });

      $httpBackend.flush();
      $scope.$apply();

    }));

    it('should initialize with notifications from backend', function () {

      expect($scope.cmsNotifications[0].title).to.equal('We\'ve Made An Update!');

    });

    it('should provide a function to add new notifications to top of notifications list', function () {

      var prevLength = $scope.cmsNotifications.length;

      $scope.newCmsNotification();

      var newLength = $scope.cmsNotifications.length,
          newCmsNotification = $scope.cmsNotifications[0];

      expect(newLength).to.equal(prevLength + 1);

      // we only care about ensuring that there's no post / notify end date for new posts
      expect(newCmsNotification.post_date).to.equal(null);
      expect(newCmsNotification.notify_end_date).to.equal(null);

    });

    it('should provide a function to save a notification', function () {

      var cmsNotificationToSave = $scope.newCmsNotification(),
          newPostDate = moment('2014-09-25T16:00:00-0500'),
          newNotifyEndDate = moment('2014-09-28T16:00:00-0500');

      cmsNotificationToSave.title = 'A New Notification';
      cmsNotificationToSave.body = 'Whatever balhb alhblahb.';
      cmsNotificationToSave.post_date = newPostDate;
      cmsNotificationToSave.notify_end_date = newNotifyEndDate;

      $httpBackend.expectPOST('/cms/api/v1/cms_notifications/').respond(200, cmsNotificationToSave);

      var cmsNotificationSaved = null;
      $scope.$saveCmsNotification(cmsNotificationToSave).then(function (cmsNotification) {
        cmsNotificationSaved = cmsNotification;
      });

      $httpBackend.flush();
      $scope.$apply();

      expect(cmsNotificationSaved.getRestangularUrl).not.to.be.undefined;
      expect(cmsNotificationSaved.title).to.equal(cmsNotificationToSave.title);
      expect(cmsNotificationSaved.post_date.valueOf()).to.equal(newPostDate.valueOf());
      expect(cmsNotificationSaved.notify_end_date.valueOf()).to.equal(newNotifyEndDate.valueOf());

      cmsNotificationSaved.title = 'Updated Title';
      cmsNotificationSaved.id = 0;

      $httpBackend.expectPUT('/cms/api/v1/cms_notifications/' + cmsNotificationSaved.id + '/').respond(200, cmsNotificationSaved);

      var cmsNotificationUpdated = null;
      $scope.$saveCmsNotification(cmsNotificationSaved).then(function (cmsNotification) {
        cmsNotificationUpdated = cmsNotification;
      });

      $httpBackend.flush();
      $scope.$apply();

      expect(cmsNotificationUpdated.title).to.equal(cmsNotificationSaved.title);

    });

    it('should provide a function to remove a notification', function () {

      var cmsNotificationToDelete = $scope.cmsNotifications[0],
          deleted = false,
          oldLength = $scope.cmsNotifications.length;

      $httpBackend.expectDELETE('/cms/api/v1/cms_notifications/0/').respond(200);

      $scope.$deleteCmsNotification(cmsNotificationToDelete).then(function () {
        deleted = true;
      });

      $httpBackend.flush();
      $scope.$apply();

      expect(deleted).to.equal(true);
      expect($scope.cmsNotifications.length).to.equal(oldLength - 1);

    });

  });

  describe('without editable notifications', function () {

    beforeEach(inject(function () {

      $httpBackend.expectGET('/cms/api/v1/me/').respond({
        id: 0,
        username: 'regularguy',
        email: 'regularguy@aol.com',
        first_name: 'John',
        last_name: 'Smath'
      });

    }));

    beforeEach(inject(function ($rootScope, $controller, CmsNotificationsApi, $window, moment, CurrentUserApi) {

      var today = moment();
      $httpBackend.expectGET('/cms/api/v1/cms_notifications/').respond([
        {
          id: 0,
          title: 'I Should be Listed',
          post_date: today.clone().subtract({days: 1}).format()
        },
        {
          id: 1,
          title: 'I Should Not be Listed',
          post_date: today.clone().add({days: 1}).format()
        }
      ]);

      CmsNotificationsCtrl = $controller('CmsNotificationsCtrl', {
        $window: $window,
        $scope: $scope,
        CmsNotificationsApi: CmsNotificationsApi,
        CurrentUserApi: CurrentUserApi
      });

      $httpBackend.flush();
      $scope.$apply();

    }));

    it('should not show notifications that aren\'t editable if their post date is in the future', function () {

      expect($scope.cmsNotifications.length).to.equal(1);
      expect($scope.cmsNotifications[0].id).to.equal(0);

    });

  });

});
