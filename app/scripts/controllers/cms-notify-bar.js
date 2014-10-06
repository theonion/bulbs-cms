'use strict';

/**
 * Controller for notifications bar that is displayed to users.
 */
angular.module('bulbsCmsApp')
  .controller('CmsNotifyBarCtrl', function ($scope, ipCookie, moment, CmsNotificationsApi) {

    var genCookieKey = function (id) {
      return 'dismissed-cms-notification-' + id;
    };

    // get list of notifications to show
    CmsNotificationsApi.getList().then(function (notifications) {
      var now = moment();
      $scope.notifications = _.filter(notifications, function (notification) {
        // show notifications where there is no dismiss cookie and post_date < now < notify_end_date
        return !ipCookie(genCookieKey(notification.id))
                && moment(notification.post_date).isBefore(now) && moment(notification.notify_end_date).isAfter(now);
      });
    });

    /**
     * Dismiss a given notification. Stores a dismiss cookie which will expire one day after the notification's end
     *  date.
     *
     * @param notification  Notification to dismiss.
     */
    $scope.dismissNotification = function (notification) {

      // add dismiss cookie
      var cookieKey = URLify(genCookieKey(notification.id));
      ipCookie(cookieKey, true, {
        expires: moment(notification.notify_end_date).add({days: 1}).diff(moment(), 'days')
      });

      // remove notification from bar
      var i = $scope.notifications.indexOf(notification);
      $scope.notifications.splice(i, 1);

    };

  });