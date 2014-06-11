angular.module('BettyCropper', [])
  .service('BettyCropper', function BettyCropper($http, $interpolate, $q, IMAGE_SERVER_URL, BC_API_KEY) {
    var fileInputId = '#bulbs-cms-hidden-image-file-input'
    var inputTemplate = '<input id="bulbs-cms-hidden-image-file-input" type="file" accept="image/*" style="position: absolute; left:-99999px;" name="image" />'

    this.upload = function () {
      var uploadImageDeferred = $q.defer();

      angular.element(fileInputId).remove();
      var fileInput = angular.element(inputTemplate);
      var file;
      angular.element('body').append(fileInput);
      fileInput.click();
      fileInput.unbind('change');

      fileInput.bind('change', function(elem){
        if (this.files.length != 1) {
          uploadImageDeferred.reject('We need exactly one image!');
        }
        var file = this.files[0];
        if (file.type.indexOf('image/') != 0) {
          uploadImageDeferred.reject('Not an image!');
        }

        if (file.size > 10*1024*1024) { //MAGIC!
          uploadImageDeferred.reject('The file is too large!')
        }

        newImage(file).success(function(success){
          uploadImageDeferred.resolve(success);
        }).error(function(error){
          uploadImageDeferred.reject(error);
        });

      });

      return uploadImageDeferred.promise;
    }

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

    this.detailPatch = function (id, name, credit, selections) {
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

    function newImage (image, name, credit) {
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

    this.updateSelection = function (id, ratio, selections) {
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

    this.origJpg = function (id, width) {
      return this.url(id, 'original', width, 'jpg');
    };

    this.origGif = function (id, width) {
      return this.url(id, 'original', width, 'gif');
    };

  });
