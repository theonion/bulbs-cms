'use strict';

angular.module('bulbsCmsApp')
  .directive('onionEditor', function (PARTIALS_URL, $, Zencoder, BettyCropper,
      openImageCropModal, VIDEO_EMBED_URL, OnionEditor, CmsImage) {
    return {
      require: 'ngModel',
      replace: true,
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'editor.html',
      scope: {
        ngModel: '='
      },
      link: function (scope, element, attrs, ngModel) {

        if (!ngModel) {
          return;
        }

        var formatting;
        if (attrs.formatting) {
          formatting = attrs.formatting.split(',');
        }

        var options = {};
        var defaultValue = '';

        if (attrs.role === 'multiline') {
          defaultValue = '<p><br></p>';
          options = {
            // global options
            multiline: true,
            formatting: formatting || ['link', 'bold', 'italic', 'blockquote', 'heading', 'list', 'strike', 'underline'],
            placeholder: {
              text: attrs.placeholder ||  '<p>Write here</p>',
              container: $('.editorPlaceholder', element[0])[0],
            },
            link: {
              domain: attrs.linkDomain || false,
              // Sean, you can figure out a nicer way to handle the search handler.
              searchHandler: window[attrs.linkSearchHandler] || false
            },
            statsContainer: '.wordcount',
            inlineObjects: attrs.inlineObjects,
            image: {
              insertDialog: BettyCropper.upload,
              editDialog: openImageCropModal,
            },
            video: {
              insertDialog: Zencoder.onVideoFileUpload,
              editDialog: Zencoder.openVideoThumbnailModal,
              videoEmbedUrl: VIDEO_EMBED_URL
            }
          };
        } else {
          $('.document-tools, .embed-tools', element).hide();
          options = {
            // global options
            multiline: false,
            placeholder: {
              text: attrs.placeholder || 'Write here',
              container: $('.editorPlaceholder', element[0])[0],
            },
            formatting: formatting || []
          };
        }

        var editor = new OnionEditor($('.editor', element[0])[0], options);

        ngModel.$render = function () {
          editor.setContent(ngModel.$viewValue || defaultValue);
          CmsImage.picturefill(element);
          editor.setChangeHandler(read);
        };

        // Redefine what empty looks like
        ngModel.$isEmpty = function (value) {
          return ! value || editor.scribe.allowsBlockElements() && value === defaultValue;
        };

        // Write data to the model
        var read = function () {
          var html = editor.getContent();
          if (html === defaultValue) {
            html = '';
          } else {
            CmsImage.picturefill(element);
          }
          ngModel.$setViewValue(html);
        };
      }
    };
  });
