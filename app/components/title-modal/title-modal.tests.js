'use strict';

describe('Directive: titleModalOpener', function () {

  var $;
  var $modal;
  var $q;
  var $rootScope;
  var digest;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.titleModal');
    module('jquery');
    module('jsTemplates');

    inject(function (_$_, _$modal_, _$q_,  _$rootScope_, $compile) {
      $ = _$_;
      $modal = _$modal_;
      $q = _$q_;
      $rootScope = _$rootScope_;

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $rootScope.$new()
      );
    });
  });

  afterEach(function () {
    sandbox.restore();

    $(document).find('#titleModal').each(function () {
      $(this).remove();
    });
  });

  it('should add the class "title-modal-opener" to opener', function () {
    sandbox.stub($modal, 'open').returns({ result:  $q.defer().promise });

    var element = digest('<div title-modal-opener></div>');

    expect(element.hasClass('title-modal-opener'));
  });

  it('should open a title modal when element is clicked', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest('<div title-modal-opener></div>');

    element.trigger('click');

    expect($modal.open.calledOnce).to.equal(true);
  });

  it('should allow customized title text', function () {
    var title = 'Some Garbage Title';
    var element = digest(
      '<div title-modal-opener modal-title="' + title + '"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect($(document).find('#titleModal .modal-title').html())
      .to.have.string(title);
  });

  it('should allow customized cancel text', function () {
    var cancel = 'DISMISS ME';
    var element = digest(
      '<div title-modal-opener modal-cancel-text="' + cancel + '"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect($(document).find('#titleModal button[ng-click="$dismiss()"]').eq(1).html())
      .to.have.string(cancel);
  });

  it('should customized ok text', function () {
    var ok = 'OKAY ME';
    var element = digest(
      '<div title-modal-opener modal-ok-text="' + ok + '"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect(
        $(document)
        .find('#titleModal button[ng-click="$close({ title: newTitle })"]')
        .html()
      )
      .to.have.string(ok);
  });

  it('should call modal-on-ok with new title when okayed', function () {
    $rootScope.modalOkayed = sandbox.stub();
    var newTitle = 'My Garbage Title';
    var element = digest(
      '<div title-modal-opener modal-on-ok="modalOkayed(title)"></div>'
    );
    element.trigger('click');
    $rootScope.$digest();
    var modal = $(document).find('#titleModal');

    modal.scope().newTitle = newTitle;
    $(document)
      .find('#titleModal button[ng-click="$close({ title: newTitle })"]')
      .trigger('click');

    expect($rootScope.modalOkayed.calledWith(newTitle)).to.equal(true);
  });

  it('should call modal-on-cancel when canceled', function () {
    $rootScope.modalCanceled = sandbox.stub();
    var element = digest(
      '<div title-modal-opener modal-on-cancel="modalCanceled()"></div>'
    );
    element.trigger('click');
    $rootScope.$digest();

    $(document)
      .find('#titleModal button[ng-click="$dismiss()"]')
      .trigger('click');

    expect($rootScope.modalCanceled.calledOnce).to.equal(true);
  });

  it('should only allow one instance of modal to be opened', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest('<div title-modal-opener></div>');

    element.trigger('click');
    element.trigger('click');

    expect($modal.open.calledOnce).to.equal(true);
  });
});
