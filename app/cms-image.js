(function( w ){
    /* We can request an image at every possible width, but let's limit it to a reasonable number
       We can set these so they correspond to our more common sizes.
    */

    var breakpoints = [0, 80, 150, 240, 300, 320, 400, 480, 620, 640, 820, 960, 1200, 1600];
    function tmpl(text, dict) {
        for (var k in dict) {
            text = text.replace("{{" + k + "}}", dict[k]);
        }
        return text;
    }
    w.picturefill = function() {
        //don't need to do them all at once. can decide to do lazy load if needed
        var ps = w.document.getElementsByTagName( "div" );
        var imageData = [];
        for( var i = 0, il = ps.length; i < il; i++ ){
            var el = ps[i];
            if(el.getAttribute( "data-type" ) !== "image" ){
                continue;
            }
            var div = el.getElementsByTagName( "div" )[0];
            if( el.getAttribute( "data-image-id" ) !== null ){
                var id = el.getAttribute( "data-image-id" ),
                    crop = el.getAttribute( "data-crop" );
                var _w = div.offsetWidth,
                    _h = div.offsetHeight;

                if (!crop || crop === "" || crop === "auto") {
                    crop = computeAspectRatio(_w, _h);
                }
                if (el.getAttribute("data-format")) {
                    format = el.getAttribute("data-format");
                }
                else {
                    format = "jpg";
                }

                var width = 50;
                for (var j = 0; j < breakpoints.length; j++) {
                    if (_w <= breakpoints[j]) {
                        width = breakpoints[j];
                        break;
                    }
                }
                // TODO: do something for retina
                if (w.devicePixelRatio) {
                    if (w.devicePixelRatio > 1) {

                    }
                }

                // if the existing image is larger (or the same) than the one we're about to load, do not update.
                //however if the crop changes, we need to reload.
                if (width > 0) {
                    var tmp = div;
                    if (id) {
                        $.ajax({
                            url: w.BC_ADMIN_URL + '/api/' + id,
                            headers: {
                                'X-Betty-Api-Key': w.BC_API_KEY,
                                'Content-Type': undefined
                            },
                            success: function (res) {
                                var imageData = res;
                                if (crop === "original") {
                                    $('>div', tmp).css({'padding-bottom': ((res.height / res.width) * 100) + '%'});
                                    var cropDetails = {x0:0, x1:res.width, y0:0, y1:res.height};
                                }
                                else {
                                    var cropDetails = imageData.selections[crop]
                                }
                                computeStyle(tmp, imageData, cropDetails )
                            }
                        });
                    }
                }
            }
        }
    };

    function computeStyle(element, image, selection) {
        var scale, styles,
        el_height = (image.height / image.width) * $(element).width(),
        s_width = selection.x1 - selection.x0,
        s_height = selection.y1 - selection.y0,
        tmp_selection = selection;
        
        if (!s_width || !s_height) {
          /*
              If we have bogus selections, make
              the crop equal to the whole image
          */
          s_width = $(element).width();
          s_height = el_height;
          tmp_selection = {
            'x0': 0,
            'y0': 0,
            'x1': s_width,
            'y1': s_height
          };
        }

        scale = $(element).width() / s_width;

        element.style.background = 'url(' +
            w.BC_ADMIN_URL + '/' + image.id + '/original/1200.jpg' +
        ')';
        element.style.backgroundSize = scaleNumber(image.width, scale) + 'px';
        element.style.backgroundPosition = '' +
          '-' + scaleNumber(tmp_selection.x0, scale) + 'px ' +
          '-' + scaleNumber(tmp_selection.y0, scale) + 'px';
        element.style.backgroundRepeat = 'no-repeat';
        element.style.height = scaleNumber(s_height, scale) + 'px';
        element.style.width = scaleNumber(s_width, scale) + 'px';
        element.style.position = 'relative';


    }

    function scaleNumber(num, by_scale) {
      return Math.floor(num * by_scale);
    };


    function computeAspectRatio(_w, _h) {
        if (_w !== 0 && _h !== 0) {
            var aspectRatio = Math.ceil(_w/_h * 10);
            //smooth out rounding issues.
            switch (aspectRatio) {
                case 30:
                case 31:
                    crop = "3x1";
                    break;
                case 20:
                    crop = "2x1";
                    break;
                case 14:
                    crop = "4x3";
                    break;
                case 18:
                    crop = "16x9";
                    break;
                case 8:
                    crop = "3x4";
                    break;
                case 10:
                    crop = "1x1";
                    break;
                default:
                    crop = "original";
            }
            return crop;
        }
        else {
            return "16x9"
        }
    }

    // NOTE: this is used elsewhere so I'm putting it back in for now.
    w.pictureFillElement = function(el) {
        var div = el.getElementsByTagName( "div" )[0];

        if( el.getAttribute( "data-image-id" ) !== null ){
            var id = el.getAttribute( "data-image-id" ),
                crop = el.getAttribute( "data-crop" );
            var _w = div.offsetWidth,
                _h = div.offsetHeight;


            if (!crop || crop === "" || crop === "auto") {
                crop = computeAspectRatio(_w, _h);
            }
            if (el.getAttribute("data-format")) {
                format = el.getAttribute("data-format");
            }
            else {
                format = "jpg";
            }


            var width = 50;
            for (var j = 0; j < breakpoints.length; j++) {
                if (_w <= breakpoints[j]) {
                    width = breakpoints[j];
                    break;
                }
            }
            // TODO: do something for retina
            if (w.devicePixelRatio) {
                if (w.devicePixelRatio > 1) {

                }
            }

            // if the existing image is larger (or the same) than the one we're about to load, do not update.
            //however if the crop changes, we need to reload.
            if (width > 0) {
                var tmp = div;
                if (id) {
                    $.ajax({
                        url: w.BC_ADMIN_URL + '/api/' + id,
                        headers: {
                            'X-Betty-Api-Key': w.BC_API_KEY,
                            'Content-Type': undefined
                        },
                        success: function (res) {
                            var imageData = res;
                            computeStyle(tmp, imageData, imageData.selections[crop])
                        },
                        error: function (res, status) {
                            if (status === '404') {

                            }
                        }
                    });
                }
            }
        }
    };

    // Run on resize and domready (w.load as a fallback)
    if (!w.IMAGE_LISTENERS_DISABLED) {
        if( w.addEventListener ){
            var pictureFillTimeout;
            w.addEventListener( "resize",
                function() {
                    clearTimeout(pictureFillTimeout);
                    pictureFillTimeout = setTimeout(w.picturefill, 100);
                }, false );

            w.addEventListener( "DOMContentLoaded", function(){
                w.picturefill();
                // Run once only
                w.removeEventListener( "load", w.picturefill, false );
            }, false );
            w.addEventListener( "load", w.picturefill, false );

        }
        else if( w.attachEvent ){
            w.attachEvent( "onload", w.picturefill );
        }
    }
}( this ));
