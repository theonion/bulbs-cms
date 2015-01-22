'use strict';

angular.module('bulbsCmsApp')
  .directive('createContent', function ($http, $window, $, IfExistsElse, Login, ContentFactory, routes, AUTO_ADD_AUTHOR, Raven) {
    return {
      restrict: 'E',
      templateUrl:  routes.DIRECTIVE_PARTIALS_URL + 'create-content.html',
      controller: function ($scope) {
        $scope.gotTags = false;
        $scope.gotUser = false;
        $scope.gotSave = false;
        $scope.$watch(function () {
          return $scope.gotTags && $scope.gotUser && $scope.gotSave;
        }, function (val) {
          if (val) {
            saveArticle($scope.init);
          }
        });

        $scope.newArticle = function (e) {
          var init = {'title': $scope.newTitle};
          angular.extend($scope.init, init);

          if ($scope.tag) {
            IfExistsElse.ifExistsElse(
              ContentFactory.all('tag').getList({
                ordering: 'name',
                search: $scope.tag
              }),
              {slug: $scope.tag},
              function (tag) { $scope.init.tags = [tag]; $scope.gotTags = true; },
              function (value) { console.log('couldnt find tag ' + value.slug + ' for initial value'); },
              function (data, status, headers, config) { Raven.captureMessage('Error Creating Article', {extra: data}); }
            );
          } else {
            $scope.gotTags = true;
          }

          if (AUTO_ADD_AUTHOR) {
            ContentFactory.one('me').get().then(function (data) {
              $scope.init.authors = [data];
              $scope.gotUser = true;
            });
          } else {
            $scope.gotUser = true;
          }

          $scope.gotSave = true;
        };

        function saveArticle() {
          $('button.go').removeClass('btn-danger').addClass('btn-success').html('<i class="fa fa-refresh fa-spin"></i> Going');
          $http({
            url: '/cms/api/v1/content/?doctype=' + $scope.contentType,
            method: 'POST',
            data: $scope.init
          }).success(function (resp) {
            var new_id = resp.id;
            var new_path = '/cms/app/edit/' + new_id + '/';
            if ($scope.rating_type) {
              new_path += '?rating_type=' + $scope.rating_type;
            }
            $window.location.href = $window.location.origin + new_path;
          }).error(function (data, status, headers, config) {
            if (status === 403) {
              $('button.go')
                .html('<i class="glyphicon glyphicon-exclamation-sign"></i> Please Log In');
            } else {
              $('button.go').removeClass('btn-success').addClass('btn-danger').html('<i class="glyphicon glyphicon-remove"></i> Error');
            }
            $scope.gotSave = false;
          });
        }


      },
      link: function (scope, element, attrs) {
        //HEY THIS SUCKS
        //TODO: This sucks!
        scope.panel = 1;

        $(element).find('a.create-content').on('click', function (e) {
          $('a.create-content.active').removeClass('active');
          $(this).addClass('active');
        });

        $(element).find('a.create-content').on('click', function (e) {
          scope.contentTypeLabel = $(this).text();
          scope.contentType = $(this).data('content_type') || null;
          scope.init = $(this).data('init') || {};
          scope.tag = $(this).data('tag') || null;
          scope.rating_type = $(this).data('rating_type') || null;
          scope.$apply();

          if ($(this).hasClass('go-next')) {
            e.preventDefault();

            $('#create button.next-pane').click();
            return false;
          }

          return true;
        });

        $('button.next-pane:not(.hide)').on('click', function (e) {
          scope.panel = 2;
          $('.new-title').focus();
        });

        $(element).on('keydown', '.editor', function (e) {
          if (e.keyCode === 13 && scope.newTitle) {
            $(element).find('.go').click();
          }
        });

        $('#create').on('hidden.bs.modal', function () {
          scope.newTitle = '';
          scope.panel = 1;
        });

      }

    };
  });
