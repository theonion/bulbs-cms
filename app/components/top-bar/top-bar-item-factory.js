'use strict';

angular.module('topBar.item.factory', [])
  .factory('TopBarItem', function () {

    var TopBarItem = function (params) {
      this.displayText = params.displayText || '';
      this.displayIconClasses = params.displayIconClasses || '';
      this.containerClasses = params.containerClasses || '';
      this.clickFunction = params.clickFunction || function () {};
    };

    return TopBarItem;
  });
