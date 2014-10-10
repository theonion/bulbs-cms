'use strict';

/**
 * Controller for notifications bar that is displayed to users.
 */
angular.module('bulbsCmsApp')
  .controller('CmsNotifyPopupsCtrl', function ($scope, $window, ipCookie, moment, CmsNotificationsApi, PNotify) {

    var genCookieKey = function (id) {
          return 'dismissed-cms-notification-' + id;
        },
        notify = function (notification) {
          new PNotify({
            title: 'New Update',
            text: notification.title,
            type: 'info',
            mouse_reset: false,
            hide: false,
            confirm: {
              confirm: true,
              buttons: [{
                text: 'Learn More',
                addClass: 'btn-info',
                click: function (notice) {
                  notice.mouse_reset = false;
                  notice.remove();

                  // take user to notifications page
                  $window.location.href = '/cms/app/notifications/'
                }
              }, {
                addClass: 'hide'
              }]
            },
            buttons: {
              sticker: false,
              closer_hover: false
            },
            before_close: function () {
              // add dismiss cookie
              var cookieKey = URLify(genCookieKey(notification.id));
              ipCookie(cookieKey, true, {
                expires: moment(notification.notify_end_date).add({days: 1}).diff(moment(), 'days'),
                path: '/cms/app'
              });
            }
          });
        };

    // show notifications
    CmsNotificationsApi.getList().then(function (notifications) {
      var now = moment();
      $scope.notifications = _.each(notifications, function (notification) {
        // show notifications where there is no dismiss cookie and post_date < now < notify_end_date
        if (!ipCookie(genCookieKey(notification.id))
            && moment(notification.post_date).isBefore(now)
            && moment(notification.notify_end_date).isAfter(now)) {
          notify(notification);
        }
      });
    });

  });