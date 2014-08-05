'use strict';

var BettyCropper = angular.module('BettyCropper', ['restangular']);
BettyCropper.value('DEFAULT_IMAGE_WIDTH', 1200);
BettyCropper.factory('Selection', function () {

  function Selection(data) {
      this.x0 = data.x0;
      this.x1 = data.x1;
      this.y0 = data.y0;
      this.y1 = data.y1;
      this.source = data.source;
  }

  Selection.prototype.width = function () {
    return this.x1 - this.x0;
  };

  Selection.prototype.height = function () {
    return this.y1 - this.y0;
  };

  Selection.prototype.scaleToFit = function (width, height) {

    var scale;
    if (width && height) {
      var fitRatio = width / height;
      var thisRatio = this.width() / this.height();
      if (fitRatio > thisRatio) {
        scale = height/ this.height();
      } else {
        scale = width / this.width();
      }
    } else {
      if (width) {
        scale = width / this.width();
      }
      if (height) {
        scale = height/ this.height();
      }
    }

    var scaledToFit = new Selection({
      x0: Math.round(this.x0 * scale),
      x1: Math.round(this.x1 * scale),
      y0: Math.round(this.y0 * scale),
      y1: Math.round(this.y1 * scale)
    });
    return scaledToFit;
  };

  return Selection;
});

// BettyCropper.factory('BettyImage', function ($interpolate, Restangular, IMAGE_SERVER_URL, BC_API_KEY) {
//   var api = Restangular.withConfig(function (RestangularConfigurer) {
//     RestangularConfigurer.setDefaultHttpFields({
//       'X-Betty-Api-Key': BC_API_KEY + '/'
//     });
//     RestangularConfigurer.setBaseUrl(IMAGE_SERVER_URL);
//   });
//   return api.service('api');
// });
BettyCropper.factory('BettyImage', function ($interpolate, $http, IMAGE_SERVER_URL, BC_API_KEY, DEFAULT_IMAGE_WIDTH, Selection) {

  function BettyImage(data) {
    this.id = data.id;
    this.name = data.name;
    this.width = data.width;
    this.height = data.height;
    this.selections = {};
    for (var ratio in data.selections) {
      this.selections[ratio] = new Selection(data.selections[ratio]);
    }
  }

  BettyImage.prototype.getStyles = function(element, ratio) {
    var width = element.parent().width();
    var height = element.parent().height();

    if (height === 0) {
      height = null;
    }

    var selection = this.selections[ratio];
    var scaledSelection = selection.scaleToFit(width, height);

    return {
      'background-image': 'url(' + this.url('original', DEFAULT_IMAGE_WIDTH, 'jpg') + ')',
      'background-size': Math.floor(scaledSelection.width() / selection.width()  * this.width) + 'px',
      'background-position': '-' + scaledSelection.x0 + 'px -' + scaledSelection.y0 + 'px',
      'height': scaledSelection.height() + 'px',
      'width': scaledSelection.width() + 'px',
      'background-repeat': 'no-repeat',
      'position': 'relative'
    };
  };

  BettyImage.prototype.url = function (ratio, width, format) {
    var exp = $interpolate(
      '{{ base_url }}/{{ id }}/{{ ratio }}/{{ width }}.{{ format }}'
    );
    var idStr = this.id.toString();
    var segmentedId = '';
    for (var i=0; i < idStr.length; i++) {
      if (i % 4 === 0 && i !== 0) {
        segmentedId += '/';
      }
      segmentedId += idStr.substr(i, 1);
    }
    return exp({
      base_url: IMAGE_SERVER_URL,
      id: segmentedId,
      ratio: ratio,
      width: width,
      format: format
    });
  };
  return BettyImage;
});
BettyCropper.service('BettyCropper', function BettyCropper($http, $interpolate, $q, IMAGE_SERVER_URL, BC_API_KEY, BettyImage) {
    var fileInputId = '#bulbs-cms-hidden-image-file-input';
    var inputTemplate = '<input id="bulbs-cms-hidden-image-file-input" type="file" accept="image/*" style="position: absolute; left:-99999px;" name="image" />';

    this.upload = function () {
      var uploadImageDeferred = $q.defer();

      angular.element(fileInputId).remove();
      var fileInput = angular.element(inputTemplate);
      angular.element('body').append(fileInput);
      fileInput.click();
      fileInput.unbind('change');

      fileInput.bind('change', function (elem) {
        if (this.files.length !== 1) {
          uploadImageDeferred.reject('We need exactly one image!');
        }
        var file = this.files[0];
        if (file.type.indexOf('image/') !== 0) {
          uploadImageDeferred.reject('Not an image!');
        }

        if (file.size > 10 * 1024 * 1024) { // MAGIC!
          uploadImageDeferred.reject('The file is too large!');
        }

        var imageData = new FormData();
        imageData.append('image', file);

        $http({
          method: 'POST',
          url: IMAGE_SERVER_URL + '/api/new',
          headers: {
            'X-Betty-Api-Key': BC_API_KEY,
            'Content-Type': undefined,
            'X-CSRFToken': undefined
          },
          data: imageData,
          transformRequest: angular.identity,
          transformResponse: function (data, headersGetter) {
            return new BettyImage(data);
          }
        }).success(function (success) {
          uploadImageDeferred.resolve(success);
        }).error(function (error) {
          uploadImageDeferred.reject(error);
        });

      });

      return uploadImageDeferred.promise;
    };

    this.get = function (id) {
      return $http({
        method: 'GET',
        url: IMAGE_SERVER_URL + '/api/' + id,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        transformRequest: angular.identity,
        transformResponse: function (data, headersGetter) {
          return new BettyImage(data);
        }
      });
    };

    this.detail = this.get;

    this.detailPatch = function (id, name, credit, selections) {
      return $http({
        method: 'PATCH',
        url: IMAGE_SERVER_URL + '/api/' + id,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: {
          name: name,
          credit: credit,
          selections: selections
        },
        transformRequest: angular.identity,
        transformResponse: function (data, headersGetter) {
          return new BettyImage(data);
        }
      });
    };

    this.updateSelection = function (id, ratio, selections) {
      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/' + id + '/' + ratio,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: selections
      });
    };

    this.url = function (id, crop, width, format) {
      var exp = $interpolate(
        '{{ url }}/{{ id }}/{{ crop }}/{{ width }}.{{ format }}'
      );
      return exp({
        url: IMAGE_SERVER_URL,
        id: id,
        crop: crop,
        width: width,
        format: format
      });
    };

    this.origJpg = function (id, width) {
      return this.url(id, 'original', width, 'jpg');
    };

    this.origGif = function (id, width) {
      return this.url(id, 'original', width, 'gif');
    };

  });
