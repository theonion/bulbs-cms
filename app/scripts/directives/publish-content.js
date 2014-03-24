'use strict';

angular.module('bulbsCmsApp')
  .directive('publishContent', function ($http) {
    return {
      restrict: 'E',
      templateUrl:  PARTIALS_URL + 'publish-content.html',
      link: function(scope, element, attrs){
        //note: define publisSuccessCbk in whatever controller this directive goes in
        scope.openPubTimeModal = function(article){
          scope.pubTimeArticle = article;
        }

        scope.openSendToEditorModal = function(article){
          scope.pubTimeArticle = article;
        }

        scope.pubTimeCancel = function(){
          scope.pubTimeArticle = null;
        }

        scope.pubTimeSave = function(article){
          if(!article.feature_type){
            $("#pubTimeValidationModal").modal("show");
            return;
          }
          var newPubDate = $("#chooseDate .date input").val();
          if(newPubDate){
            //the CST locks this to CST.
            newPubDate = moment(newPubDate, "MM/DD/YYYY hh:mm a CST").format("YYYY-MM-DDTHH:mmZ");
          }
          var data = {published: newPubDate};
          putChanges(article, data);
        }

        scope.pubUnpublish = function(article){
          $("#chooseDate .date input").val('');
          var data = {published: false};
          putChanges(article, data);
        }

        function putChanges(article, data){
          $http({
            url: '/cms/api/v1/content/' + article.id + '/publish/',
            method: 'POST',
            data: data
          }).success(function(resp){
            scope.publishSuccessCbk(article, resp);
          }).error(function(error, status, data){
            if(status === 403){
              scope.showLoginModal();
            }
          })
        }

        $('#chooseDate .datetimepicker2').datetimepicker({ // init
          language: 'en',
          pick12HourFormat: true,
          pickSeconds: false,
          maskInput: false
        });

        scope.sendToEditor = function(article){
          $http({
            url: '/cms/api/v1/content/' + article.id + '/send/',
            method: 'POST',
            data: {notes: scope.noteToEditor}
          }).success(function(data){
            scope.publishSuccessCbk(article, data);
          })
        }

        scope.saveThenOpenSendModal = function(article){
          scope.saveArticle().then(function(){
            scope.openSendToEditorModal(article);
            $("#sendToEditor").modal("show");
          })
        }

        scope.saveThenPublish = function(article){
          scope.saveArticle().then(function(){
            scope.openPubTimeModal(article);
            $("#chooseDate").modal("show");
          });
        }

      }
    };
  });
