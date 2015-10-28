'use strict';

angular.module('cms.image', [
  'cms.config',
  'jquery'
])
  .service('CmsImage', [
    '$', 'CmsConfig',
    function ($, CmsConfig) {

      /* We can request an image at every possible width, but let's limit it to a reasonable number
         We can set these so they correspond to our more common sizes.
      */

      var styleCrop = function (data, options) {
        var cropDetails;
        if (options.crop === 'original') {
          createStyle('.image[data-image-id="' + options.id + '"]>div', {
            'padding-bottom': ((data.height / data.width) * 100) + '%'
          }, 'image-css-' + options.id + '-crop');

          cropDetails = {
            x0: 0,
            x1: data.width,
            y0: 0,
            y1: data.height
          };
        } else {
          cropDetails = data.selections[options.crop];
        }

        computeStyle(options.elementDiv, data, cropDetails);
      };

      var styleOriginalCrop = function (data, options) {
        if (options.crop === 'original') {
          //default to 16x9
          createStyle('.image[data-image-id="' + options.id + '"]>div', {
            'padding-bottom': '56.25%', // default to 16x9 for errors
            'background-color': 'rgba(200, 0,0, .5)'
          }, 'image-css-' + options.id + '-crop');
        }
      };

      var computeStyle = function (element, image, selection) {
        var selector = '.image[data-image-id="' + image.id + '"]>div';
        var elementWidth = $(selector).width();

        var scale;
        var elementHeight = (image.height / image.width) * elementWidth;
        var s_width = selection.x1 - selection.x0;
        var s_height = selection.y1 - selection.y0;
        var tmp_selection = selection;

        if (!s_width || !s_height) {
          /*
              If we have bogus selections, make
              the crop equal to the whole image
          */
          s_width = elementWidth;
          s_height = elementHeight;
          tmp_selection = {
            'x0': 0,
            'y0': 0,
            'x1': s_width,
            'y1': s_height
          };
        }

        var imageUrl = CmsConfig.buildImageServerUrl(
          '/' + image.id + '/original/' + CmsConfig.getImageDefaultWidth() + '.jpg'
        );
        scale = elementWidth / s_width;

        var rules = {
          'background-image': 'url(' + imageUrl + ')',
          'background-size': scaleNumber(image.width, scale) + 'px',
          'background-position': '-' + scaleNumber(tmp_selection.x0, scale) + 'px ' +
            '-' + scaleNumber(tmp_selection.y0, scale) + 'px',
          'background-repeat': 'no-repeat'
        };
        createStyle(selector, rules, 'image-css-' + image.id + '-computed-style');
      };

      var createStyle = function (selector, rules, styleId) {
        var $existingStyle = $('#' + styleId);

        var $styleNode;
        if ($existingStyle.length > 0) {
          $styleNode = $existingStyle;
          $styleNode.empty();
        } else {
          $styleNode = $('<style id="' + styleId + '" type="text/css">');
          $(document).find('head').append($styleNode);
        }

        var css = '' + selector + '{';
        for (var rule in rules) {
          css += rule + ':' + rules[rule] + ' !important;';
        }
        css += '}';

        $styleNode.append(css);
      };

      var scaleNumber = function (num, by_scale) {
        return Math.floor(num * by_scale);
      };

      var computeAspectRatio = function (_w, _h) {
        if (_w !== 0 && _h !== 0) {
          var aspectRatio = Math.ceil(_w / _h * 10);
          var crop = 'original';
          //smooth out rounding issues.
          switch (aspectRatio) {
            case 30:
            case 31:
              crop = '3x1';
              break;
            case 20:
              crop = '2x1';
              break;
            case 14:
              crop = '4x3';
              break;
            case 18:
              crop = '16x9';
              break;
            case 8:
              crop = '3x4';
              break;
            case 10:
              crop = '1x1';
              break;
          }
          return crop;
        } else {
          return '16x9';
        }
      };

      this.picturefill = function (element) {
        var $el;
        if (typeof element === 'undefined') {
          $el = $(document);
        } else {
          $el = $(element);
        }

        var $ps;
        if ($el.data('type') === 'image') {
          $ps = $el;
        } else {
          $ps = $el.find('div[data-type="image"]');
        }

        $ps.each(function (i, el) {
          var $imgContainer = $(el);
          var imgId = $imgContainer.data('imageId');

          if (typeof imgId === 'number') {
            var $div = $imgContainer.children('div');
            var currCrop = $imgContainer.attr('data-crop');
            var computedCrop = computeAspectRatio($div.width(), $div.height());
            var isCropChanged = computedCrop !== currCrop;
            // HACK : something causes images to reload if using properties on elmeents
            //  inside the editor
            var isRendered = $('.image-css-' + imgId).length > 0;

            if (!isRendered || isCropChanged) {

              var crop = 'original';
              if (!isRendered) {
                crop = currCrop;
              } else if (isCropChanged){
                crop = computedCrop;
              }

              $.ajax({
                url: CmsConfig.buildImageServerUrl('/api/' + imgId),
                headers: {
                  'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
                  'Content-Type': undefined
                }
              })
              .done(function (data) {
                styleCrop(data, {
                  elementDiv: $div[0],
                  id: imgId,
                  crop: crop
                });
              })
              .fail(function (data) {
                styleOriginalCrop(data, {
                  id: imgId,
                  crop: crop
                });
              });
            }
          }
        });
      };

      return this;
    }
  ]);
