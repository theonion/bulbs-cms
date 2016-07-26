'use strict';

// note: this jshint exception is for URLify, which is just a function not a constructor
/* jshint newcap: false */

/**
 * Controller for CMS notifications bar that is displayed to users.
 */
angular.module('bulbsCmsApp')
  .controller('CmsNotifyContainerCtrl', function ($scope, ipCookie, moment, CmsNotificationsApi, URLify, _) {

    var genCookieKey = function (id) {
      return 'dismissed-cms-notification-' + id;
    };
    var updateCmsNotificationsDisplay = function (cmsNotifications) {
      var now = moment();
      $scope.cmsNotifications = _.filter(cmsNotifications, function (cmsNotification) {
        // show CMS notifications where there is no dismiss cookie and post_date < now < notify_end_date
        if (!ipCookie(genCookieKey(cmsNotification.id)) &&
              moment(cmsNotification.post_date).isBefore(now) &&
              moment(cmsNotification.notify_end_date).isAfter(now)) {
          return true;
        }
      });
    };

    // show CMS notifications
    CmsNotificationsApi.getList().then(function (cmsNotifications) {
      updateCmsNotificationsDisplay(cmsNotifications);
    });

    $scope.dismissCmsNotification = function (cmsNotification) {
      // add dismiss cookie
      var cookieKey = URLify(genCookieKey(cmsNotification.id));
      ipCookie(cookieKey, true, {
        expires: moment(cmsNotification.notify_end_date).add({days: 1}).diff(moment(), 'days'),
        path: '/cms/app'
      });

      // hide notification
      updateCmsNotificationsDisplay($scope.cmsNotifications);
    };

  });
