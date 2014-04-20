'use strict';

angular.module('bulbsCmsApp')
  .directive('bettyeditable', function ($http, routes, BC_API_KEY) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'bettyeditable.html',
      scope: {
        'imageId': '=',
        'ratio': "@"
      },
      controller: function ($scope, $element, $attrs, $http, routes, BC_API_KEY) {

        $scope.imageData = null;

        $scope.getImageData = function() {
          $http({
            method: 'GET',
            url: routes.IMAGE_SERVER_URL + '/api/' + $scope.imageId,
            headers: {
              'X-Betty-Api-Key': BC_API_KEY,
              'Content-Type': undefined
            },
            transformRequest: angular.identity
          }).success(function(response){
            $scope.imageData = response;
            $scope.showImage();
          });
        };

        $scope.showImage = function(){
          if($scope.imageData === null) {
            console.log("Getting selections!");
            $scope.getImageData();
            return;
          }
          var pictureDiv = $element.find("div")[1];
          var pushdownDiv = $element.find("div")[0];
          pictureDiv.className = "picture";

          var ratioWidth = parseInt($scope.ratio.split('x')[0], 10);
          var ratioHeight = parseInt($scope.ratio.split('x')[1], 10);

          pushdownDiv.style.paddingTop = (ratioHeight / ratioWidth * 100) + "%";
          pictureDiv.style.backgroundImage = 'url(' + routes.IMAGE_SERVER_URL + '/' + $scope.imageId + '/original/' + 1200 + '.jpg)';
          
          var selection = $scope.imageData.selections[$scope.ratio];

          var leftPosition = selection.x0 / 1200 * 100;
          var topPosition = selection.y0 / (1200 * ratioHeight / ratioWidth) * 100;

          pictureDiv.style.backgroundPosition = leftPosition + "% " + topPosition + "%, center";
          pictureDiv.style.backgroundSize = "cover";
        }

        $scope.uploadSuccess = function(response){
          $scope.imageId = response.id;
          $scope.imageData = response;
          $scope.showImage();
        }

        $scope.upload = function(e){
          if (this.files.length != 1) {
            console.log("We need exactly one image!");
            return;
          }
          var file = this.files[0];
          if (file.type.indexOf("image/") != 0) {
            console.log("Not an image!");
            return;
          }

          if (file.size > 6800000) {
            console.log("The file is too large!")
          }

          var imageData = new FormData();
          imageData.append('image', file);

          $http({
            method: 'POST',
            url: routes.IMAGE_SERVER_URL + '/api/new',
            headers: {
              'X-Betty-Api-Key': BC_API_KEY,
              'Content-Type': undefined
            },
            data: imageData,
            transformRequest: angular.identity
          }).success($scope.uploadSuccess);
        };
      },
      link: function (scope, element, attrs) {

        var input = element.find("input");
        input.on("change", scope.upload);

        var pictureDiv = element.find("div")[1];
        var pushdownDiv = element.find("div")[0];

        var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
        var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);

        pushdownDiv.style.paddingTop = (ratioHeight / ratioWidth * 100) + "%";


        if (scope.imageId === undefined) {
          pictureDiv.className = 'picture fa fa-picture-o';
          element.on("click", function(e){
            e.stopPropagation();
            input[0].click();
          });
        } else {
          scope.showImage();
        }
      }
    };
  });