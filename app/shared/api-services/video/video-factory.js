'use strict';

angular.module('apiServices.video.factory', [
  'apiServices'
])
  .value('VIDEOHUB_CHANNEL', 'onion')
  .factory('Video', function (_, restmod, VIDEOHUB_CHANNEL) {
    var singleRoot = 'root';
    var videohubEndpoint = 'videohub-video';

    var search = restmod.model(videohubEndpoint + '/search_hub').mix({
      $config: {
        jsonRootSingle: singleRoot
      },
      results: {
        hasMany: 'Video'
      },
      $hooks: {
        'after-request': function (_req) {
          // another dirty hack so we don't have to modify DefaultPicker
          var newData = {};
          newData[singleRoot] = _req.data;
          _req.data = newData;
        }
      }
    });

    var video = restmod.model(videohubEndpoint).mix({
      $config: {
        name: 'Video',
        primaryKey: 'id'
      },
      $extend: {
        Model: {
          searchVideoHub: function (query) {
            return search
              .$create({
                query: query,
                filters: {
                  channel: VIDEOHUB_CHANNEL
                }
              })
              .$asPromise();
          }
        }
      }
    });

    return video;
  });
