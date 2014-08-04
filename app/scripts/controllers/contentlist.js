'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentlistCtrl', function (
    $scope, $http, $timeout, $location,
    $window, $q, $, _, moment, ContentApi,
    LOADING_IMG_SRC, routes)
  {
    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.search = $location.search().search;

    var getContentCallback = function (data) {
        $scope.articles = data;
        $scope.totalItems = data.metadata.count;
      };

    $scope.getContent = function (params, merge) {
        params = params || {};
        if (merge) {
          var curParams = $location.search();
          params = $.extend(true, curParams, params);
        }

        $location.search(params);
        $scope.pageNumber = $location.search().page || '1';

        ContentApi.all('content').getList(params)
          .then(getContentCallback);
      };

    function updateIsMyStuff() {
        if (!$location.search().authors) {
          $scope.myStuff = false;
          return;
        }
        var authors = $location.search().authors;
        if (typeof(authors) === 'string') {
          authors = [authors];
        }
        if (authors.length === 1 && authors[0] === $window.current_user) {
          $scope.myStuff = true;
        } else {
          $scope.myStuff = false;
        }
      }
    updateIsMyStuff();
    $scope.getContent();

    $scope.$on('$routeUpdate', function () {
        updateIsMyStuff();
      });

    $('#meOnly').on('switch-change', function (e, data) {
        var value = data.value;
        if (value === true) {
          $scope.getContent({authors: [$window.current_user]});
        } else if (value === false) {
          $scope.getContent();
        }
      });

    $scope.goToPage = function () {
        $scope.getContent({'page': $scope.pageNumber}, true);
      };

    $scope.publishSuccessCbk = function (data) {
        var i;
        for (i = 0; i < $scope.articles.length; i++) {
          if ($scope.articles[i].id === data.article.id) {
            break;
          }
        }

        for (var field in data.response) {
          $scope.articles[i][field] = data.response[field];
        }

        return $q.when();
      };

    $scope.trashSuccessCbk = function () {
        $timeout(function () {
            $scope.getContent();
            $('#confirm-trash-modal').modal('hide');
          }, 1500);
      };

    $('.expcol').click(function (e) {
        e.preventDefault();
        var nS = $(this).attr('state') === '1' ? '0' : '1',
            i = nS ? 'minus' : 'plus',
            t = nS ? 'Collapse' : 'Expand',
            tP = $($(this).attr('href')).find('.panel-collapse');

        if ($(this).attr('state') === '0') { tP.collapse('show'); }
        else { tP.collapse('hide'); }
        $(this).html('<i class=\"fa fa-' + i + '-circle\"></i> ' + t + ' all');
        $(this).attr('state', nS);
        $window.picturefill();
      });

  })
  .directive('ngConfirmClick', [ // Used on the unpublish button
    function () {
      return {
        link: function (scope, element, attr) {
          var msg = attr.ngConfirmClick || 'Are you sure?';
          var clickAction = attr.confirmedClick;
          element.bind('click', function () {
            if (window.confirm(msg)) {
              scope.$eval(clickAction);
            }
          });
        }
      };
    }
  ]);
