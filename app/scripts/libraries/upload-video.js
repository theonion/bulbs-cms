!(function(window){
  //TODO: get from VIDEO ENCODING settings via VideoAttrs

  var POSTER_THUMBNAIL_COUNT = 20;
  var PUBLIC_URL = "http://v.theonion.com/avclubmedia/";
  //append hidden file input
  $("#s3upload-file-input").remove();
  $("body").append('<input id="s3upload-file-input" type="file" style="position: absolute; left:-99999px;" name="video" />');

  //append video edit modal
  $("#video-edit-modal").remove();
  $("body").append($($("#video-edit-modal-template").html())); //template lives in jstemplates.html

    //save button listener
  $("#video-edit-modal").find('.save-button').on('click', function(e){
    var newData = $("#video-edit-modal")[0].videoData;
    newData['poster_url'] = $("#video-edit-modal").find("input[name='poster_url']").val();
    console.log("saving video. new data:")
    console.log(newData)
    saveVideo(newData, {
      onSuccess: function(data){
        console.log("save success");
        $("[data-videoid='" + data.id + "']").find('iframe')[0].contentWindow.location.reload();
      },
      onError: function(data){
        console.log("save error");
        console.log(data);
      }
    });
  });

  $("#video-edit-modal").find('.reencode-button').on('click', function(e){
    console.log("reencode click")
    var data = $("#video-edit-modal")[0].videoData;
    encode(data.id);
  });

  $("#video-edit-modal .next-thumb").click(function(e) {
    //increment video thumb
    var index = getPosterIndex() + 1;
    if (POSTER_THUMBNAIL_COUNT - 1 < index) {
      index = 0;
    }
    setPosterUrl(posterUrl(index));
  });

  $("#video-edit-modal .prev-thumb").click(function(e) {
    //decrement video thumb
    var index = getPosterIndex() -1;
    if (index < 0) {
      index = POSTER_THUMBNAIL_COUNT - 1;
    }
    setPosterUrl(posterUrl(index));
  });

  $("#video-edit-modal input[name='poster_url']")
    .bind("change", updatePosterPreview)
    .bind("keyup", updatePosterPreview);

  function setPosterUrl(url) {
    $("#video-edit-modal input[name='poster_url']").val(url);
    updatePosterPreview();
  }

  function getPosterIndex() {
    var url = $("#video-edit-modal input[name='poster_url']").val();
    var match = url.match(/frame_(\d{4})\.jpg/);
    if (match) {
      console.log("match");
      return parseInt(match[1])
    }
    else {
      return -1;
    }
  }

  function posterUrl(index) {
    console.log($("#video-edit-modal")[0].videoData);
    var id = $("#video-edit-modal")[0].videoData.id;
    return PUBLIC_URL + "video/" + id + "/frame_"  + ("000"+ index).slice(-4) + ".jpg";
  }

  function updatePosterPreview() {
    var posterUrl = $("#video-edit-modal input[name='poster_url']").val();
    $("#video-edit-modal .poster-preview").attr("src", posterUrl);
  }

  function uploadVideo(element, callbacks) {
    console.log("upload video here");
    var input = $("#s3upload-file-input"); //make this more 'angular'
    input.click();
    input.unbind('change');
    input.bind('change', function(e) {
      doVideoUpload(element, callbacks);
    });
  }

  window.uploadVideo = uploadVideo;

  function doVideoUpload(element, callbacks) {
    console.log("doVideoUpload");
    var fileInput = $("#s3upload-file-input")[0];
    var file;

    if (fileInput.files.length !== 0) {
      file = fileInput.files[0];
      // We have a file upload limit of 1024MB
      if (file.size > (1024 * 1024 * 1024)) {
        alert("Upload file cannot be larger than 1024MB.");
        return;
      }

      if (file.type.indexOf('video/') !== 0) {
        alert("You must upload a video file.");
        return;
      }

    } else {
      return;
    }

    console.log("posting");

    var onError = function () {};
    var onSuccess = function () {};

    if (callbacks) {
      if (callbacks.onSuccess) {
        onSuccess = callbacks.onSuccess
      }
      if (callbacks.onError) {
        callbacks.onError
      }
    }

    $.ajax({
      type: "POST",
      url: "/videos/api/video/",
      data: {'name': file.name},
      success: function(data){
        onSuccess(data.id);
        $(element).attr('data-videoid', data.id);
        initVideoWidget(data.id);
        upload(file, data.id, element, callbacks);
      },
      error: function(data, status, error){
        console.log("error")
        console.log(data)
        console.log(status)
        console.log(error)
        if (data.status === 403) {
          window.showLoginModal();
        }
        onError(data);
      }
    })
  }

  function upload(file, videoid, element, callbacks){
    var url = "https://" + window.videoAttrs.bucket + ".s3.amazonaws.com";
    var formData = new FormData();
    var path = window.videoAttrs.directory + "/" + videoid + "/original";
    var filename = "s3://" + window.videoAttrs.bucket + "/" + path;

    formData.append('key', path);
    formData.append('AWSAccessKeyId', window.videoAttrs.AWSAccessKeyId);
    formData.append('acl', window.videoAttrs.acl);
    formData.append('success_action_status', window.videoAttrs.success_action_status);
    formData.append('policy', window.videoAttrs.policy);
    formData.append('signature', window.videoAttrs.signature);
    formData.append('file', file);

    $(element).append($($("#video-upload-status-overlay").html()));
    $(element).show();
    $(element).find('.upload-progress').show();
    callbacks.onProgress && callbacks.onProgress(0);

    // TODO: set it so user cant leave page right now

    jQuery.ajax(url, {
      processData: false,
      contentType: false,
      data: formData,
      type: "POST",
      xhr: function() {
        var req = $.ajaxSettings.xhr();
        if (req) {
          req.upload.addEventListener('progress', function(e) {
            var percent = (e.loaded / e.total ) * 100;
            $(element).find(".upload-progress .progress-bar").width(percent + "%");
          }, false);
        }

        return req;
      },

      success: function(data) {
        $(element).find('.video-status-container').remove();
        // TODO: user can leave page now
        encode(videoid, callbacks);
      },

      error: function(data){
        console.log("upload ERROR")
        console.log(data)
        callbacks.onError && callbacks.onError();
      }
    });
  }

  function encode(videoid){
    // Kick off the zencoder job
    console.log("encoding")
    $.ajax({
      url: '/videos/api/video/' + videoid + '/encode/',
      method: 'POST',

      success: function(data){
        console.log("encode success")
        console.log(data);
        var jobid = data.id;
        appendEncodeProgress(videoid, jobid);
      },

      error: function(){
        console.log("encode error")
      }
    });
  }

  function initVideoWidget(id){
    console.log("init video widget")
    //get video data
    $.get('/videos/api/video/' + id + '/', function(data){
      bindEditEvents(data);
      var status = data.status;
      if (status == "In Progress") {
        appendEncodeProgress(id, data.job_id);
      }
    });
  }

  window.initVideoWidget = initVideoWidget;

  function bindEditEvents(data){
    var container = $("[data-videoid='" + data.id + "']");
    container.css('position', 'relative');

    //show/hide button listeners
    container.find('.edit-button').on('click', function(e) {
      $("#video-edit-modal").find(".video-name").text(data.name);
      $("#video-edit-modal").find("input[name='poster_url']").val(data.poster_url);
      $("#video-edit-modal")[0].videoData = data;
      $("#video-edit-modal .poster-preview").attr("src", data.poster_url);
      $("#video-edit-modal").modal("show");
    });
  }

  function editVideo(id){
    $.get('/videos/api/video/' + id + '/', function(data){
      $("#video-edit-modal").find("h3.video-name").text(data.name);
      $("#video-edit-modal").find("input[name='poster_url']").val(data.poster_url);
      $("#video-edit-modal .poster-preview").attr("src", data.poster_url);
      $("#video-edit-modal")[0].videoData = data;
      $("#video-edit-modal").modal("show");
    });
  }

  window.editVideo = editVideo;

  function saveVideo(data, callbacks){
    console.log("save video here")
    console.log(data)
    $.ajax('/videos/api/video/' + data.id + '/',
      {
        type: 'PUT',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        processData: false,
        success: callbacks.onSuccess,
        error: callbacks.onError
      }
    );
  }

  function appendEncodeProgress(videoid, jobid){
    console.log("append encode progress")
    var container = $("[data-videoid='" + videoid + "']");
    container.find('.video-status-container').remove();
    container.append($("#video-encode-status-overlay").html());
    container.find('.video-edit-container').addClass('encoding');

    updateEncodeProgress(jobid, container);
  }

  function updateEncodeProgress(jobid, container){
    $.ajax("https://app.zencoder.com/api/v2/jobs/" + jobid + "/progress.json", {
      type: "GET",
      data: {
        api_key: window.videoAttrs.zencoderApiKey
      },

      success: function(data) {
        if (data.state === "waiting" || data.state === "pending" || data.state === "processing") {
          if (data.progress > 5) {
            $(container).find('.progress-bar').width(data.progress + '%');
              setTimeout(function(){ updateEncodeProgress(jobid, container) }, 2000);
          } else {
            setTimeout(function(){ updateEncodeProgress(jobid, container) }, 2000);
          }
        } else {
          encodingWidgetCleanup(container);
        }
      }
    });
  }

  function cancelEncode(videoid, jobid){
    var container = $("[data-videoid='" + videoid + "']");
    $.ajax("https://app.zencoder.com/api/v2/jobs/" + jobid + "/cancel.json?api_key=" + window.videoAttrs.zencoderApiKey, {
      type: "PUT",

      success: function(data) {
        encodingWidgetCleanup(container);
      }
    });
  }

  function encodingWidgetCleanup(container){
    container.find('.video-status-container').remove();
    container.find('.video-edit-container').removeClass('encoding');
    container.find('iframe')[0].contentWindow.location.reload();
  }
})(window);
