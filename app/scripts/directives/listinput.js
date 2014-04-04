'use strict';

angular.module('bulbsCmsApp')
  .directive('listinput', function ($, PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'listinput.html',
      scope: {
        'model': '='
      },
      link: function (scope, element, attrs) {
        scope.label = attrs.label;
        scope.noun = attrs.noun;
        element.find('input')[0].setAttribute('name', attrs.noun);
        element.find('input').bind('focus', function (e) {
          $(element).find('.preview').hide();
          $(element).find('.all-container').show();
        });
        element.find('input').bind('blur', function (e) {
          $(element).find('.all-container').hide();
          $(element).find('.preview').show();
        });
        element.find('input').bind('keyup', function (e) {
          if (e.keyCode === 13) {
            var value = $(this).val();
            if (value.length > 0) {
              if (!scope.model) {
                scope.model = [];
              }
              scope.model.push($(this).val());
              scope.$apply();
              $(this).val('');
            }

          }
        });
      }

    };
  });
