'use strict';

angular.module('bulbsCmsApp')
  .provider('EditorOptions', function () {
    var _options = {
      "image": {
        "size": ["big", "medium", "small"],
        "crop": ["original", "16x9", "1x1", "3x1"],
        "defaults": {
          "size": "big",
          "crop": "original",
          "image_id": 0,
          "caption": "",
          "url": "",
          "format": "jpg"
        },
        "template":
          "<div data-type=\"image\" class=\"onion-image image inline size-{{size}} crop-{{crop}}\" data-image-id=\"{{image_id}}\" data-size=\"{{size}}\" data-crop=\"{{crop}}\" data-format=\"{{format}}\"><div></div><span class=\"caption\">{{caption}}</span></div>"
      },
      "onion-video": {
        "size": ["big"],
        "crop": ["16x9"],
        "defaults": {
          "size": "big",
          "crop": "16x9"
        },
        "template":
          "<div data-type=\"onion-video\" class=\"onion-video video inline size-{{size}} crop-{{crop}}\" data-video-id=\"{{video_id}}\" data-size=\"{{size}}\" data-crop=\"{{crop}}\"><div><iframe src=\"/videos/embed?id={{video_id}}\"></iframe></div></div>"
      },
      "embed": {
        "size": ["original", "big", "small"],
        "crop": ["16x9", "4x3", "auto"],
        "defaults": {
          "size":"original",
          "crop": "auto"
        },
        "template":
          "<div data-type=\"embed\" data-crop=\"{{crop}}\" class=\"inline embed size-{{size}} crop-{{crop}}\" data-source=\"{{source}}\"><div>{{embed_code}}</div><span class=\"caption\">{{caption}}</span><a class=\"source\" target=\"_blank\" href=\"{{source}}\">Source</a></div>"
      },
      "youtube": {
        "size": ["big"],
        "crop": ["16x9", "4x3"],
        "defaults": {
          "size": "big",
          "crop": "16x9",
          "youtube_id": "foMQX9ZExsE",
          "caption": ""
        },
        "template":
        "<div data-type=\"youtube\" class=\"youtube inline size-{{size}} crop-{{crop}}\" data-youtube-id=\"{{youtube_id}}\" data-size=\"{{size}}\" data-crop=\"{{crop}}\"><div><img src=\"http://img.youtube.com/vi/{{youtube_id}}/hqdefault.jpg\"></div<span class=\"caption\">{{caption}}</span></div>"
      }
    };

    this.setOptions = function(options) {
      _options = options;
    };

    this.$get = function () {
      return {
        getOptions: function () {
          return _options;
        }
      };
    };

  })
  .directive('onionEditor', function (routes, $, Zencoder, BettyCropper, openImageCropModal, EditorOptions, VIDEO_EMBED_URL) {

    /* Gab configuration out of .  */

    return {
      require: 'ngModel',
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'editor.html',
      scope: {ngModel:'='},
      link: function(scope, element, attrs, ngModel) {

        if (!ngModel) {
          return;
        }

        if (attrs.role == "multiline") {
          var defaultValue = "<p><br></p>";
          var options = {
            /* global options */
            element: element[0],
            onContentChange: read,
            toolbar: {
              linkTools: $("#link-tools-template").html()
            },
            undoManager: new UndoManager(),
            placeholder: attrs.placeholder ||  "Write here",
            editSource: true,
            // NOT SURE WHAT TO DO ABOUT THIS....
            avlink: {
              thingsUrl: "/cms/api/v1/things/",
              contentUrl:"/cms/api/v1/content/",
              host: "avclub.com"
            },
            statsContainer: ".wordcount",
            /* This probably deserves its own file */
            inline: EditorOptions.getOptions(),
            uploadImage: BettyCropper.upload,
            editImage: openImageCropModal,
            uploadVideo: Zencoder.onVideoFileUpload,
            videoEmbedUrl: VIDEO_EMBED_URL
          }
        }
        else {
          $(".document-tools, .embed-tools", element).hide();
          var defaultValue = "";
          var options = {
            /* global options */
            element: element[0],
            onContentChange: read,
            placeholder: attrs.placeholder ||  "Type your Headline",
            allowNewline: false,
            allowNbsp: false,
            characterLimit: 200,
            sanitize: {
              elements: ['i', 'em'],
              remove_contents: ['script', 'style', ],
            }
          }
        }

        var editor = new Editor(options);

        ngModel.$render = function() {
          editor.setContent(ngModel.$viewValue || defaultValue);
        }
        // Write data to the model
        function read() {
          scope.$apply(function(){
            var html = editor.getContent();
            if (html.trim() === defaultValue) {
              html = "";
            }
            ngModel.$setViewValue(html);
          });
        }

        scope.$watch(ngModel, function() {
          editor.setContent(ngModel.$viewValue || defaultValue);
        });
      }
    };
  });