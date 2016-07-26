'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationsCtrl', function ($q, $window, $scope, CmsConfig,
      CmsNotificationsApi, CurrentUser, _, moment) {

    $window.document.title = CmsConfig.getCmsName() + ' | CMS Notifications';

    // get user info
    CurrentUser.$retrieveData().then(function (user) {
      if (user.is_superuser) {
        $scope.userIsSuperuser = true;
      }

      // get list of CMS notifications
      CmsNotificationsApi.getList().then(function (cmsNotifications) {
        // filter out CMS notifications for regular users that have a post date in the future
        var removeIndicies = [];
        _.each(cmsNotifications, function (cmsNotification, i) {
          if (!user.is_superuser && moment(cmsNotification.post_date).isAfter(moment())) {
            removeIndicies.push(i);
          }
        });
        _.each(removeIndicies, function (i) {
          cmsNotifications.splice(i, 1);
        });

        $scope.cmsNotifications = cmsNotifications;
      });
    });

    /**
     * Create a new notification, plain old object since we don't want to save invalid objects to the db.
     *
     * @return  new notification with only nulled date properties.
     */
    $scope.newCmsNotification = function () {

      var cmsNotification = {
        post_date: null,
        notify_end_date: null
      };

      $scope.cmsNotifications.unshift(cmsNotification);

      return cmsNotification;

    };

    /**
     * Save given notification to the database.
     *
     * @param notification  Notification to save.
     * @return  promise that resolves when notification is saved.
     */
    $scope.$saveCmsNotification = function (cmsNotification) {

      var saveDefer = $q.defer(),
          savePromise = saveDefer.promise;

      if ($scope.userIsSuperuser) {
        if ('id' in cmsNotification) {
          // this thing already exists, update it
          cmsNotification.put().then(function (updatedCmsNotification) {
            saveDefer.resolve(updatedCmsNotification);
          });
        } else {
          // a new notification, post it to the list
          $scope.cmsNotifications.post(cmsNotification)
            .then(function (newCmsNotification) {
              // save succeeded, replace notification with restangularized notification
              var i = $scope.cmsNotifications.indexOf(cmsNotification);
              $scope.cmsNotifications[i] = newCmsNotification;
              saveDefer.resolve(newCmsNotification);
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
    $scope.$deleteCmsNotification = function (cmsNotification) {

      var deleteDefer = $q.defer(),
          deletePromise = deleteDefer.promise,
          removeFromList = function (index) {
            $scope.cmsNotifications.splice(index, 1);
            deleteDefer.resolve();
          };

      if ($scope.userIsSuperuser) {
        // find notification in list
        var i = $scope.cmsNotifications.indexOf(cmsNotification);
        if (i > -1) {
          // notification in list, check if it is a restangular object and has a remove function
          if (_.isFunction(cmsNotification.remove)) {
            // has remove, call it and resolve promise
            cmsNotification.remove()
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
