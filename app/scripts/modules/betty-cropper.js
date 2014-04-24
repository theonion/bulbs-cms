angular.module('bettyCropper', [])
  .service('$bettycropper', function $bettycropper($http, $interpolate, IMAGE_SERVER_URL, BC_API_KEY) {

    /*\

      Betty Cropper API

    \*/

    this.detail = function (id) {
      return $http({
        method: 'GET',
        url: IMAGE_SERVER_URL + '/api/' + id,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined
        },
        transformRequest: angular.identity
      });
    };

    this.detail_patch = function (id, name, credit, selections) {
      return $http({
        method: 'PATCH',
        url: IMAGE_SERVER_URL + '/api/' + id,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined
        },
        data: {
          name: name,
          credit: credit,
          selections: selections
        },
        transformRequest: angular.identity
      });
    };

    this.new = function (image, name, credit) {
      var imageData = new FormData();
      imageData.append('image', image);
      if (name) { imageData.append('name', name); }
      if (credit) { imageData.append('credit', credit); }

      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/new',
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined
        },
        data: imageData,
        transformRequest: angular.identity
      });
    };

    this.update_selection = function (id, ratio, selections) {
      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/' + id + "/" + ratio,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined
        },
        data: selections
      });
    };

    /*\

      Convenience Methods

    \*/

    this.url = function (id, crop, width, format) {
      var exp = $interpolate(
        "{{ url }}/{{ id }}/{{ crop }}/{{ width }}.{{ format }}"
      );
      return exp({
        url: IMAGE_SERVER_URL,
        id: id,
        crop: crop,
        width: width,
        format: format
      });
    };

    this.orig_jpg = function (id, width) {
      return this.url(id, 'original', width, 'jpg');
    };

    this.orig_gif = function (id, width) {
      return this.url(id, 'original', width, 'gif');
    };

  });
