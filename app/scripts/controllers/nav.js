'use strict';

angular.module('bulbsCmsApp')
  .controller('NavCtrl', function ($scope, $rootScope, $location, Contenteditservice, PARTIALS_URL) {
    $scope.PARTIALS_URL = PARTIALS_URL;

    function updateNavType(location){
      console.log(location);
      $scope.navType = 'list';
      if(location.indexOf('/cms/app/edit/') > 0){
        console.log("setting navType edit")
        $scope.navType = 'edit';
      }
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current){
      updateNavType(next);
    });

    $scope.$watch('Contenteditservice.content', function(){
      console.log("content edit service watcher");
      $scope.article = Contenteditservice.content;
    });

    $scope.isActive = function (viewLocation) {
      return $location.path().indexOf(viewLocation) === 0;
    };

  });
