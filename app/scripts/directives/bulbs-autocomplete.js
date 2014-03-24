'use strict';

angular.module('bulbsCmsApp')
  .directive('bulbsAutocomplete', function ($http, $location, $compile, $timeout) {
    return {
      restrict: 'A',
      scope: true,
      link: function postLink(scope, element, attrs) {
        scope.displayfn = scope[attrs.displayfn];
        scope.callback = scope[attrs.callback];
        var $elem = $(element).find("input");
        $elem.attr('autocomplete', 'off');
        var dropdown = $($compile($("#autocomplete-dropdown-template").html())(scope));
        $(dropdown).css({
          position: 'absolute',
          top: $elem.position().top + $elem.outerHeight(),
          left: $elem.position().left,
          minWidth: $elem.outerWidth(),
          display: 'none'
        });
        $elem.parent().append(dropdown);
        $(dropdown).fadeIn('fast');

        // Observe the element's dimensions.
        scope.$watch(
          function(){
            return {
              top: $elem.position().top + $elem.outerHeight(),
              left: $elem.position().left,
              minWidth: $elem.outerWidth()
            };
          },
          function (newValue, oldValue) {
            $(dropdown).css({
              top: newValue.top,
              left: newValue.left,
              minWidth: newValue.minWidth
            });
          },
          true
        );

        var inputCounter = 0, inputTimeout;

        $elem.on('focus', function(e){
          $elem.on('input', function(){
            var val = $elem.val();
            if(val === ""){
              scope.autocomplete_list = [];
              //if (!scope.$$phase) scope.$apply();
            }else{
              $timeout.cancel(inputTimeout);
              inputTimeout = $timeout(function(){ getAutocompletes(val); }, 200);

              if(inputCounter > 2){
                getAutocompletes(val);
              }
            }
          });
          $(dropdown).fadeIn('fast');
        });

        function getAutocompletes(val){
          $timeout.cancel(inputTimeout);
          inputCounter = 0;
          $http({
            method: 'GET',
            url: attrs.resourceUrl + val
          }).success(function(data){
            var results = data.results || data;
            scope.autocomplete_list = results.splice(0, 5);
          }).error(function(data, status, headers, config){
            if(status === 403){
              scope.showLoginModal();
            }
          });
        }

        scope.blurTimeout;
        $elem.on('blur', function(e){
          $(dropdown).fadeOut('fast');
        });

        $(dropdown).on('mouseover', '.entry', function(e){
          $(dropdown).find('.selected').removeClass('selected');
          $(this).addClass('selected')
        })

        $elem.on('keyup', function(e){
          if(e.keyCode === 40){ //down
            if($('div.selected', dropdown).length === 0){
              $('div.entry', dropdown).first().addClass('selected');
            }else{
              var curSelect = $('div.selected', dropdown);
              var curSelectNext = curSelect.next('div');
              if(curSelectNext.length === 0){
                $('div.entry', dropdown).first().addClass('selected');
              }else{
                curSelectNext.addClass('selected');
              }
              curSelect.removeClass('selected');
            }
          }
          if(e.keyCode === 38){ //up
            if($('div.selected', dropdown).length === 0){
              $('div.entry', dropdown).last().addClass('selected');
            }else{
              var curSelect = $('div.selected', dropdown);
              var curSelectNext = curSelect.prev('div');
              if(curSelectNext.length === 0){
                $('div.entry', dropdown).last().addClass('selected');
              }else{
                curSelectNext.addClass('selected');
              }
              curSelect.removeClass('selected');
            }
          }
          if(e.keyCode === 13){
            var selected = $('div.selected', dropdown);
            if(selected.length === 0) scope.onClick($elem.val(), true)
            selected.click();
          }
        });

        scope.onClick = function(o, freeForm){
          scope.callback(o, $elem, freeForm || false);
          scope.autocomplete_list = [];
          //if (!scope.$$phase) scope.$apply();
        }

      }
    };
  });
