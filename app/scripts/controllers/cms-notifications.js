'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationsCtrl', function ($q, $window, $scope, routes, CmsNotificationsApi, CurrentUser, _, moment) {

    // set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Notifications';

    // get user info
    CurrentUser.$retrieveData().then(function (user) {
      if (user.is_superuser) {
        $scope.userIsSuperuser = true;
      }

      // get list of notifications
      CmsNotificationsApi.getList().then(function (notifications) {
        // filter out notifications for regular users that have a post date in the future
        var removeIndicies = [];
        _.each(notifications, function (notification, i) {
          if (!user.is_superuser && moment(notification.post_date).isAfter(moment())) {
            removeIndicies.push(i);
          }
        });
        _.each(removeIndicies, function (i) {
          notifications.splice(i, 1);
        });

        $scope.notifications = notifications;
      });
    });

    /**
     * Create a new notification, plain old object since we don't want to save invalid objects to the db.
     *
     * @return  new notification with only nulled date properties.
     */
    $scope.newNotification = function () {

      var notification = {
        post_date: null,
        notify_end_date: null
      };

      $scope.notifications.unshift(notification);

      return notification;

    };

    /**
     * Save given notification to the database.
     *
     * @param notification  Notification to save.
     * @return  promise that resolves when notification is saved.
     */
    $scope.$saveNotification = function (notification) {

      var saveDefer = $q.defer(),
          savePromise = saveDefer.promise;

      if ($scope.userIsSuperuser) {
        if ('id' in notification) {
          // this thing already exists, update it
          notification.put().then(function (updatedNotification) {
            saveDefer.resolve(updatedNotification);
          });
        } else {
          // a new notification, post it to the list
          $scope.notifications.post(notification)
            .then(function (newNotification) {
              // save succeeded, replace notification with restangularized notification
              var i = $scope.notifications.indexOf(notification);
              $scope.notifications[i] = newNotification;
              saveDefer.resolve(newNotification);
            })
            .catch(function (error) {
              saveDefer.reject(error);
            });
        }
      } else {
        saveDefer.reject('Insufficient permissions.');
      }

      return savePromise;

    };

    /**
     * Delete given notification from the database.
     *
     * @param notification  Notification to delete.
     * @return  promise that resolves when notification is deleted.
     */
    $scope.$deleteNotification = function (notification) {

      var deleteDefer = $q.defer(),
          deletePromise = deleteDefer.promise,
          removeFromList = function (index) {
            $scope.notifications.splice(index, 1);
            deleteDefer.resolve();
          };

      if ($scope.userIsSuperuser) {
        // find notification in list
        var i = $scope.notifications.indexOf(notification);
        if (i > -1) {
          // notification in list, check if it is a restangular object and has a remove function
          if (_.isFunction(notification.remove)) {
            // has remove, call it and resolve promise
            notification.remove()
              .then(function () {
                removeFromList(i);
              })
              .catch(function (error) {
                deleteDefer.reject(error);
              });
          } else {
            // does not have remove, this is a previously unsaved notification, just remove it from list
            removeFromList(i);
          }
        } else {
          deleteDefer.reject('Cannot find notification in notification list. Unable to delete.');
        }
      } else {
        deleteDefer.reject('You do not have sufficient permissions to delete a notification.');
      }

      return deletePromise;

    };

  });
