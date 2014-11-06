'use strict';
(function () {
  angular.module('BettyCropper', ['restangular', 'jquery'])
    .value('DEFAULT_IMAGE_WIDTH', 1200)
    .factory('Selection', SelectionFactory)
    .factory('BettyImage', BettyImageFactory)
    .service('BettyCropper', BettyCropperService);

  function BettyCropperService($http, $interpolate, $q, IMAGE_SERVER_URL, BC_API_KEY, BettyImage, $) {
      var fileInputId = '#bulbs-cms-hidden-image-file-input';
      var inputTemplate = '<input id="bulbs-cms-hidden-image-file-input" type="file" accept="image/*" style="position: absolute; left:-99999px;" name="image" />';

      this.upload = upload;
      this.get = get;
      this.detail = get;
      this.detailPatch = detailPatch;
      this.updateSelection = updateSelection;

      function upload() {
        var uploadImageDeferred = $q.defer();

        angular.element(fileInputId).remove();
        var fileInput = angular.element(inputTemplate);
        angular.element('body').append(fileInput);

        fileInput.click();

        fileInput.unbind('change');
        fileInput.bind('change', function (e) {
          if (e.target.files.length !== 1) {
            uploadImageDeferred.reject('We need exactly one image!');
          }
          var file = e.target.files[0];
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
              // So, sometimes the browser doesn't think that JSON data is JSON.
              if (typeof data === 'string') {
                data = $.parseJSON(data);
              }
              var image = new BettyImage(data);
              return image;
            }
          }).success(function (success) {
            uploadImageDeferred.resolve(success);
          }).error(function (error) {
            uploadImageDeferred.reject(error);
          });

        });

        return uploadImageDeferred.promise;
      }

      function get(id) {
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
            if (typeof data === 'string') {
              data = $.parseJSON(data);
            }
            return new BettyImage(data);
          }
        });
      }

      function detailPatch(id, name, credit, selections) {
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
            if (typeof data === 'string') {
              data = $.parseJSON(data);
            }
            return new BettyImage(data);
          }
        });
      }

      function updateSelection(id, ratio, selections) {
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
      }
    }

  function BettyImageFactory($interpolate, $http, IMAGE_SERVER_URL, BC_API_KEY, DEFAULT_IMAGE_WIDTH, Selection, $) {
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

    BettyImage.prototype.scaleToFit = function (width, height) {
      var scale;
      if (width && height) {
        var fitRatio = width / height;
        var thisRatio = this.width / this.height;
        if (fitRatio > thisRatio) {
          scale = height / this.height;
        } else {
          scale = width / this.width;
        }
      } else {
        if (width) {
          scale = width / this.width;
        }
        if (height) {
          scale = height / this.height;
        }
      }
      var scaled = {
        width: Math.round(this.width * scale),
        height: Math.round(this.height * scale),
        scale: scale
      };
      return scaled;
    };

    BettyImage.prototype.getStyles = function (width, height, ratio) {
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
      for (var i = 0; i < idStr.length; i++) {
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

    BettyImage.prototype.updateSelection = function (ratio, selection) {
      var data = {
        x0: selection.x0,
        x1: selection.x1,
        y0: selection.y0,
        y1: selection.y1
      };
      if (selection.source) {
        data.source = selection.source;
      }
      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/' + this.id + '/' + ratio,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: data,
        transformResponse: function (data, headersGetter) {
          if (typeof data === 'string') {
            data = $.parseJSON(data);
          }
          return [ratio, new Selection(data.selections[ratio])];
        }
      });
    };

    return BettyImage;
  }

  function SelectionFactory() {
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

    Selection.prototype.scaleBy = function (scale) {
      var scaledToFit = new Selection({
        x0: Math.round(this.x0 * scale),
        x1: Math.round(this.x1 * scale),
        y0: Math.round(this.y0 * scale),
        y1: Math.round(this.y1 * scale)
      });
      return scaledToFit;
    };

    Selection.prototype.scaleToFit = function (width, height) {

      var scale;
      if (width && height) {
        var fitRatio = width / height;
        var thisRatio = this.width() / this.height();
        if (fitRatio > thisRatio) {
          scale = height / this.height();
        } else {
          scale = width / this.width();
        }
      } else {
        if (width) {
          scale = width / this.width();
        }
        if (height) {
          scale = height / this.height();
        }
      }
      return this.scaleBy(scale);
    };

    return Selection;
  }
})();
