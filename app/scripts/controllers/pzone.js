'use strict';

angular.module('bulbsCmsApp')
  .controller('PzoneCtrl', function ($scope, $http, $window, Contentlist) {
    //set title
    $window.document.title = "AVCMS | Pzone Editor";

    function getPzone(){
        $http({
            method: 'GET',
            url: '/promotions/api/pzone/' + $scope.pzoneName + '/'
        }).success(function(data){
            $scope.pzone = data;
        }).error(function(data){
            console.log("Zone does not exist.");
        });
    }

    $scope.pzoneName = "homepage-one";
    $scope.newContentId = null;
    $scope.$watch('pzoneName', function(){
        getPzone();
    });

    $scope.typeChanged = function() {
        console.log("Type changed!");
        if($scope.pzone !== undefined) {
            $scope.pzone.data = {};
        }
    };

    Contentlist.setUrl('/cms/api/v1/content/?published=True');
    var getContentCallback = function($scope, data){
        $scope.articles = data.results;
        $scope.totalItems = data.count;
    };
    $scope.getContent = function(){
        Contentlist.getContent($scope, getContentCallback);
    };
    $scope.getContent();

    $scope.getPZoneTemplate = function(){
        return PARTIALS_URL + 'pzones/' + $scope.pzone.zone_type + '.html';
    };

    $scope.remove = function(contentId) {
        var index = $scope.pzone.data.content_ids.indexOf(contentId);
        if(index !== -1) {
            $scope.pzone.data.content_ids.splice(index, 1);
        }
    };

    $scope.add = function(prepend){
        if ($scope.pzone.data.content_ids === undefined) {
            $scope.pzone.data.content_ids = [];
        }
        if(prepend && $scope.newContentIdPrepend){
            $scope.pzone.data.content_ids.unshift($scope.newContentIdPrepend);
        }else if($scope.newContentId){
            $scope.pzone.data.content_ids.push($scope.newContentId);
        }
        $scope.newContentId = null;
        $scope.newContentIdPrepend = null;
    };

    $scope.save = function(){
        $("#save-pzone-btn").html('<i class="fa fa-refresh fa-spin"></i> Saving');
        $http({
            method: 'PUT',
            url: '/promotions/api/pzone/' + $scope.pzoneName + '/',
            data: $scope.pzone
        }).success(function(data){
            $("#save-pzone-btn").html('<i class="fa fa-check" style="color:green"></i> Saved!');
            window.setTimeout(function () {
                $("#save-pzone-btn").html('Save');
            }, 2000);
        }).error(function(data){
            $("#save-pzone-btn").html('<i class="fa fa-frown" style="color:red"></i> Saved!');
            window.setTimeout(function () {
                $("#save-pzone-btn").html('Save');
            }, 2000);
        });
    };


  });
