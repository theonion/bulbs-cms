'use strict';

describe('Directive: superFeaturesRelationsModalOpener', function () {

  var $;
  var $modal;
  var $q;
  var $rootScope;
  var digest;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.superFeatures.relations.modal');
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

    $(document).find('#superFeaturesRelationsModal').each(function () {
      $(this).remove();
    });
  });

  it('should add the class "super-features-relations-modal-opener" to opener', function () {
    sandbox.stub($modal, 'open').returns({ result:  $q.defer().promise });

    var element = digest('<div super-features-relations-modal-opener></div>');

    expect(element.hasClass('super-features-relations-modal-opener'));
  });

  it('should add modalChoice elements to the modal', function() {
    $rootScope.superFeatureTypes = ['typeA', 'typeB', 'typeC', 'typeD'];
    var element = digest(
      '<div super-features-relations-modal-opener modal-choices="superFeatureTypes"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect($(document).find('#superFeaturesRelationsModal').eq(0).html())
      .to.have.string('typeA');
  });

  it('should open a superfeature relations modal when element is clicked', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest('<div super-features-relations-modal-opener></div>');

    element.trigger('click');

    expect($modal.open.calledOnce).to.equal(true);
  });

  it('should allow superfeature type selection with setRelationTypeChoice', function () {
    $rootScope.superFeatureTypes = ['typeA', 'typeB', 'typeC', 'typeD'];
    var element = digest(
        '<div super-features-relations-modal-opener modal-choices="superFeatureTypes"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    var modalElement = $(document).find('#superFeaturesRelationsModal');

    var childActive = modalElement.find('.active');
    expect(childActive.length).to.equal(0);

    var ulElement = modalElement.find('ul');

    var childElements = ulElement.find('a');
    expect(childElements.length).to.equal(4);

    var childFirst = childElements[0];
    $(childFirst).click();

    childActive = modalElement.find('.active');
    expect(childActive.length).to.equal(1);
    expect(childActive.text()).to.have.string('typeA');
    expect(element.isolateScope().modalRelationType).to.equal('typeA');

    var childSecond = childElements[1];
    $(childSecond).click();

    childActive = modalElement.find('.active');
    expect(childActive.length).to.equal(1);
    expect(childActive.text()).to.have.string('typeB');
    expect(element.isolateScope().modalRelationType).to.equal('typeB');
  });

  it('should allow customized cancel text', function () {
    var cancel = 'DISMISS ME';
    var element = digest(
      '<div super-features-relations-modal-opener modal-cancel-text="' + cancel + '"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect($(document).find('#superFeaturesRelationsModal button[ng-click="$dismiss()"]').eq(1).html())
      .to.have.string(cancel);
  });

  it('should customized ok text', function () {
    var ok = 'OKAY ME';
    var element = digest(
      '<div super-features-relations-modal-opener modal-ok-text="' + ok + '"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect(
        $(document)
        .find('#superFeaturesRelationsModal')
        .html()
      )
      .to.have.string(ok);
  });

  it('should allow customized before body text', function () {
    $rootScope.text = 'some text';
    var element = digest(
      '<div super-features-relations-modal-opener modal-body-before="{{ text }}"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect($(document).find('#superFeaturesRelationsModal .modal-body').html())
      .to.have.string($rootScope.text);
  });

  it('should allow customized after body text', function () {
    $rootScope.text = 'some text';
    var element = digest(
      '<div super-features-relations-modal-opener modal-body-after="{{ text }}"></div>'
    );

    element.trigger('click');
    $rootScope.$digest();

    expect($(document).find('#superFeaturesRelationsModal .modal-body').html())
      .to.have.string($rootScope.text);
  });

  it('should call modal-on-ok with new relation when okayed', function () {
    $rootScope.modalOkayed = sandbox.stub();
    var newRelationType = 'typeA';
    var element = digest(
      '<div super-features-relations-modal-opener modal-on-ok="modalOkayed()"></div>'
    );
    element.trigger('click');
    $rootScope.$digest();
    var modal = $(document).find('#superFeaturesRelationsModal');

    modal.scope().modalRelationType = newRelationType;
    $(document)
      .find('#superFeaturesRelationsModal button[ng-click="$close({ superfeatureType: modalRelationType, title: newTitle })"]')
      .trigger('click');

    expect($rootScope.modalOkayed.called).to.equal(true);
  });

  it('should call modal-on-cancel when canceled', function () {
    $rootScope.modalCanceled = sandbox.stub();
    var element = digest(
      '<div super-features-relations-modal-opener modal-on-cancel="modalCanceled()"></div>'
    );
    element.trigger('click');
    $rootScope.$digest();

    $(document)
      .find('#superFeaturesRelationsModal button[ng-click="$dismiss()"]')
      .trigger('click');

    expect($rootScope.modalCanceled.calledOnce).to.equal(true);
  });

  it('should only allow one instance of modal to be opened', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest('<div super-features-relations-modal-opener></div>');

    element.trigger('click');
    element.trigger('click');

    expect($modal.open.calledOnce).to.equal(true);
  });
});
