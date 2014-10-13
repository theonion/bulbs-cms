'use strict';

/**
 * Controller for notifications bar that is displayed to users.
 */
angular.module('bulbsCmsApp')
  .controller('CmsNotifyContainerCtrl', function ($scope, $window, ipCookie, moment, CmsNotificationsApi, URLify) {

    var genCookieKey = function (id) {
          return 'dismissed-cms-notification-' + id;
        },
        updateNotificationsDisplay = function (notifications) {
          var now = moment();
          $scope.notifications = _.filter(notifications, function (notification) {
            // show notifications where there is no dismiss cookie and post_date < now < notify_end_date
            if (!ipCookie(genCookieKey(notification.id))
                && moment(notification.post_date).isBefore(now)
                && moment(notification.notify_end_date).isAfter(now)) {
              return true;
            }
          });
        };

    // show notifications
    CmsNotificationsApi.getList().then(function (notifications) {
      updateNotificationsDisplay(notifications);
    });

    $scope.dismissNotification = function (notification) {
      // add dismiss cookie
      var cookieKey = URLify(genCookieKey(notification.id));
      ipCookie(cookieKey, true, {
        expires: moment(notification.notify_end_date).add({days: 1}).diff(moment(), 'days'),
        path: '/cms/app'
      });

      // hide notification
      updateNotificationsDisplay($scope.notifications);
    };

  });