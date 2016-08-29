'use strict';

describe('Directive: sendToEditorModalOpener', function () {

  var $;
  var $modal;
  var $q;
  var $rootScope;
  var articleStatuses;
  var digest;
  var sandbox;
  var Raven;
  var SendToEditorApi;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    articleStatuses = [{
      label: 'Needs First Pass',
      value: 'Needs First Pass'
    }, {
      label: 'Needs Copy Edit',
      value: 'Needs Copy Edit'
    }];

    module(
      'bulbs.cms.sendToEditorModal',
      function (CmsConfigProvider) {
        CmsConfigProvider.addArticleEditoralStatus(
          articleStatuses[0].label,
          articleStatuses[0].value
        );
        CmsConfigProvider.addArticleEditoralStatus(
          articleStatuses[1].label,
          articleStatuses[1].value
        );
      }
    );
    module('jquery');
    module('jsTemplates');

    inject(function (_$_, _$modal_, _$q_, _$rootScope_, _Raven_, _SendToEditorApi_,
        $compile) {
      $ = _$_;
      $modal = _$modal_;
      $q = _$q_;
      $rootScope = _$rootScope_;
      Raven = _Raven_;
      SendToEditorApi = _SendToEditorApi_;

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $rootScope.$new()
      );
    });
  });

  afterEach(function () {
    sandbox.restore();

    $(document).find('#sendToEditorModal').each(function () {
      $(this).remove();
    });
  });

  it('should add the class "send-to-editor-modal-opener" to opener', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });

    var element = digest('<div send-to-editor-modal-opener></div>');

    expect(element.hasClass('send-to-editor-modal-opener'));
  });

  it('should open a send to editor modal when element is clicked', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest('<div send-to-editor-modal-opener></div>');

    element.trigger('click');
    $rootScope.$digest();

    expect($modal.open.calledOnce).to.equal(true);
  });

  it('should list article statuses from configuration', function () {
    $rootScope.modalCanceled = sandbox.stub();
    var element = digest('<div send-to-editor-modal-opener></div>');
    element.trigger('click');
    $rootScope.$digest();

    var options = $(document).find('#sendToEditorModal select option');

    expect(options.eq(0).html()).to.equal('- Article Status -');
    expect(options.eq(1).html()).to.have.string(articleStatuses[0].label);
    expect(options.eq(2).html()).to.have.string(articleStatuses[1].label);
  });

  it('should POST status and note to send endpoint when okayed', function () {
    var note = 'my garbage note for editors';
    var selectedStatusIndex = 0;
    $rootScope.article = { id: 1 };
    sandbox.stub(SendToEditorApi, 'sendToEditor').returns($q.defer().promise);
    var element = digest(
      '<div ' +
          'send-to-editor-modal-opener ' +
          'modal-article="article">' +
      '</div>'
    );
    element.trigger('click');
    $rootScope.$digest();
    var modalElement = $(document).find('#sendToEditorModal');

    modalElement.find('select').val(selectedStatusIndex).trigger('change');
    modalElement.find('textarea').val(note).trigger('change');
    modalElement.find('button[ng-click="sendToEditor(status, note)"]').trigger('click');

    expect(SendToEditorApi.sendToEditor.withArgs(
      $rootScope.article,
      articleStatuses[selectedStatusIndex].value,
      'Status: ' + articleStatuses[selectedStatusIndex].value + '\n\n' + note
    ).calledOnce).to.equal(true);
  });

  it('should call modal-on-ok when okayed and successful', function () {
    $rootScope.modalOkayed = sandbox.stub();
    var sendToEditorDeferred = $q.defer();
    sandbox.stub(SendToEditorApi, 'sendToEditor').returns(sendToEditorDeferred.promise);
    var element = digest(
      '<div ' +
          'send-to-editor-modal-opener ' +
          'modal-article="{ id: 1 }" ' +
          'modal-on-ok="modalOkayed()">' +
      '</div>'
    );
    element.trigger('click');
    $rootScope.$digest();
    var modalElement = $(document).find('#sendToEditorModal');

    modalElement.find('button[ng-click="sendToEditor(status, note)"]').trigger('click');
    sendToEditorDeferred.resolve();
    $rootScope.$digest();

    expect($rootScope.modalOkayed.calledOnce).to.equal(true);
  });

  it('should show an error when okayed but POST failed', function () {
    $rootScope.modalOkayed = sandbox.stub();
    var sendToEditorDeferred = $q.defer();
    sandbox.stub(SendToEditorApi, 'sendToEditor').returns(sendToEditorDeferred.promise);
    sandbox.stub(Raven, 'captureMessage');
    var element = digest(
      '<div ' +
          'send-to-editor-modal-opener ' +
          'modal-article="{ id: 1 }">' +
      '</div>'
    );
    element.trigger('click');
    $rootScope.$digest();
    var modalElement = $(document).find('#sendToEditorModal');

    modalElement.find('button[ng-click="sendToEditor(status, note)"]').trigger('click');
    sendToEditorDeferred.reject();
    $rootScope.$digest();

    expect(modalElement.find('.error-message-container').html())
      .to.have.string('An error occurred!');
    expect(Raven.captureMessage.calledOnce).to.equal(true);
  });

  it('should error when attempting to submit without having selected a status', function () {
    sandbox.stub(SendToEditorApi, 'sendToEditor').returns($q.defer().promise);
    var element = digest(
      '<div ' +
          'send-to-editor-modal-opener ' +
          'modal-article="{ id: 1 }">' +
      '</div>'
    );
    element.trigger('click');
    $rootScope.$digest();
    var modalElement = $(document).find('#sendToEditorModal');

    modalElement.find('select').val('').trigger('change');
    $rootScope.$digest();

    expect(modalElement.find('button[ng-click="sendToEditor(status, note)"]')
      .attr('disabled')).to.equal('disabled');
    expect(modalElement.find('select').parent().next().html())
      .to.have.string('Please select an Article Status!');
    expect(SendToEditorApi.sendToEditor.callCount).to.equal(0);
  });

  it('should call modal-on-cancel when canceled', function () {
    $rootScope.modalCanceled = sandbox.stub();
    var element = digest(
      '<div send-to-editor-modal-opener modal-on-cancel="modalCanceled()"></div>'
    );
    element.trigger('click');
    $rootScope.$digest();

    $(document)
      .find('#sendToEditorModal button[ng-click="$dismiss()"]')
      .trigger('click');

    expect($rootScope.modalCanceled.calledOnce).to.equal(true);
  });

  it('should only allow one instance of modal to be opened', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest(
      '<div send-to-editor-modal-opener></div>'
    );

    element.trigger('click');
    $rootScope.$digest();
    element.trigger('click');
    $rootScope.$digest();

    expect($modal.open.calledOnce).to.equal(true);
  });

  it('should call modal-on-before-open before opening', function () {
    $rootScope.modalBeforeOpen = sandbox.stub();
    var element = digest(
      '<div send-to-editor-modal-opener modal-on-before-open="modalBeforeOpen()"></div>'
    );

    element.trigger('click');

    expect($rootScope.modalBeforeOpen.calledOnce).to.equal(true);
  });

  it('should use promise interface given by modal-on-before-open', function () {
    var beforeOpenDeferred = $q.defer();
    $rootScope.modalBeforeOpen = sandbox.stub().returns(beforeOpenDeferred.promise);
    var element = digest(
      '<div send-to-editor-modal-opener modal-on-before-open="modalBeforeOpen()"></div>'
    );

    element.trigger('click');
    var openAtFirst = $(document).find('#sendToEditorModal').length > 0;
    beforeOpenDeferred.resolve();
    $rootScope.$digest();
    var openAfterResolve = $(document).find('#sendToEditorModal').length > 0;

    expect(openAtFirst).to.equal(false);
    expect(openAfterResolve).to.equal(true);
  });

  it('should not open modal if promise given to modal-on-before-open is rejected', function () {
    var beforeOpenDeferred = $q.defer();
    $rootScope.modalBeforeOpen = sandbox.stub().returns(beforeOpenDeferred.promise);
    var element = digest(
      '<div send-to-editor-modal-opener modal-on-before-open="modalBeforeOpen()"></div>'
    );

    element.trigger('click');
    beforeOpenDeferred.reject();
    $rootScope.$digest();
    var openAfterReject = $(document).find('#sendToEditorModal').length > 0;

    expect(openAfterReject).to.equal(false);
  });

  it('should not open modal if given false by modal-on-before-open', function () {
    $rootScope.modalBeforeOpen = sandbox.stub();
    var element = digest(
      '<div send-to-editor-modal-opener modal-on-before-open="modalBeforeOpen()"></div>'
    );

    $rootScope.modalBeforeOpen.returns(false);
    element.trigger('click');

    expect($(document).find('#sendToEditorModal').length > 0).to.equal(false);
  });
});
