'use strict';

describe('Directive: superFeaturesRelationsModalOpener', function () {

  var $;
  var $modal;
  var $q;
  var $parentScope;
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
      $parentScope = _$rootScope_.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
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
    $parentScope.superFeatureTypes = ['typeA', 'typeB', 'typeC', 'typeD'];
    var element = digest(
      '<div super-features-relations-modal-opener modal-choices="superFeatureTypes"></div>'
    );

    element.trigger('click');
    $parentScope.$digest();

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
    $parentScope.superFeatureTypes = ['typeA', 'typeB', 'typeC', 'typeD'];
    var element = digest(
        '<div super-features-relations-modal-opener modal-choices="superFeatureTypes"></div>'
    );

    element.trigger('click');
    $parentScope.$digest();

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

  it('should call modal-on-ok with new relation when okayed', function () {
    $parentScope.modalOkayed = sandbox.stub();
    var newRelationType = 'typeA';
    var element = digest(
      '<div super-features-relations-modal-opener modal-on-ok="modalOkayed()"></div>'
    );
    element.trigger('click');
    $parentScope.$digest();
    var modal = $(document).find('#superFeaturesRelationsModal');

    modal.scope().modalRelationType = newRelationType;
    $(document)
      .find('#superFeaturesRelationsModal button[ng-click="$close({ superfeatureType: modalRelationType, title: newTitle })"]')
      .trigger('click');

    expect($parentScope.modalOkayed.called).to.equal(true);
  });

  it('should call modal-on-cancel when canceled', function () {
    $parentScope.modalCanceled = sandbox.stub();
    var element = digest(
      '<div super-features-relations-modal-opener modal-on-cancel="modalCanceled()"></div>'
    );
    element.trigger('click');
    $parentScope.$digest();

    $(document)
      .find('#superFeaturesRelationsModal button[ng-click="$dismiss()"]')
      .trigger('click');

    expect($parentScope.modalCanceled.calledOnce).to.equal(true);
  });

  it('should only allow one instance of modal to be opened', function () {
    sandbox.stub($modal, 'open').returns({ result: $q.defer().promise });
    var element = digest('<div super-features-relations-modal-opener></div>');

    element.trigger('click');
    element.trigger('click');

    expect($modal.open.calledOnce).to.equal(true);
  });
});
