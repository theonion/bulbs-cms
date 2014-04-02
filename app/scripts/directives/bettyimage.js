'use strict';

angular.module('bulbsCmsApp')
  .directive('bettyimage', function ($http, PARTIALS_URL) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'bettyimage.html',
      scope: {
        'image': '=',
        'ratio': '=',
        'width': '@'
      },
      controller: function ($scope) {
      },
      link: function (scope, element, attrs) {
        scope.width = parseInt(scope.width, 10);
        var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
        var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);
        var height = (scope.width * ratioHeight / ratioWidth) + 'px';

        element.css('width', scope.width + 'px');
        element.css('height', (scope.width * ratioHeight / ratioWidth) + 'px');

        var selection = scope.image.selections[scope.ratio];
        var selectionWidth = (selection.x1 - selection.x0);
        var scale = scope.width / selectionWidth;

        var requestWidth = Math.round((scale * (scope.image.width - selectionWidth)) + scope.width);
        element.css('background-image', 'url(' + IMAGE_SERVER_URL + '/' + scope.image.id + '/original/' + requestWidth + '.jpg)');
        element.css('background-position', (scale * selection.x0 * -1) + 'px ' + (scale * selection.y0 * -1) + 'px');
      }
    };
  });
