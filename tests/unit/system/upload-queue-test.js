/* global plupload */
import Ember from 'ember';
import UploadQueue from 'ember-plupload/system/upload-queue';
import MockUploader from '../../helpers/mock-uploader';
import {
  module,
  test
} from 'qunit';

var get = Ember.get;
var originalPlupload;

module('UploadQueue', {
  beforeEach: function () {
    originalPlupload = plupload.Uploader;
    plupload.Uploader = MockUploader;
  },
  afterEach: function () {
    plupload.Uploader = originalPlupload;
  }
});

test('manages the lifecycle of uploaders (nothing queued)', function (assert) {
  var queue = UploadQueue.create();
  assert.equal(get(queue, 'length'), 0);

  var uploader = queue.configure();
  assert.equal(get(queue, 'queues.length'), 1);

  queue.orphan();
  assert.equal(get(queue, 'queues.length'), 0);
  assert.ok(uploader.unbound);
});

test('manages the lifecycle of uploaders (with queued items)', function (assert) {
  var queue = UploadQueue.create();
  assert.equal(get(queue, 'length'), 0);

  var uploader = queue.configure();
  assert.equal(get(queue, 'queues.length'), 1);
  uploader.total.queued = 1;

  queue.orphan();
  assert.equal(get(queue, 'queues.length'), 1);
  uploader.UploadComplete(uploader);
  assert.equal(get(queue, 'queues.length'), 0);
  assert.ok(uploader.unbound);
});

test('multiple uploaders can be handled simultaneously', function (assert) {
  var queue = UploadQueue.create();
  var uploader = queue.configure();
  uploader.total.queued = 1;
  assert.equal(get(queue, 'queues.length'), 1);
  queue.orphan();

  var uploader2 = queue.configure();
  uploader2.total.queued = 1;
  assert.equal(get(queue, 'queues.length'), 2);
  queue.orphan();

  uploader2.UploadComplete(uploader2);
  assert.equal(get(queue, 'queues.length'), 1);
  uploader.UploadComplete(uploader);
  assert.equal(get(queue, 'queues.length'), 0);
});

test('the progress property is computed from the totals of each uploader', function (assert) {
  var queue = UploadQueue.create();
  var uploader = queue.configure();
  var uploader2 = queue.configure();

  uploader.total.size = 7000;
  uploader2.total.size = 3000;

  uploader.total.loaded = 5500;
  uploader2.total.loaded = 2000;

  uploader.UploadProgress(uploader, {});
  assert.equal(get(queue, 'progress'), 75);
});

test('files that error are always passed to the action', function (assert) {
  var done = assert.async();
  var queue = UploadQueue.create();
  queue.target = {
    sendAction: function (action, file) {
      assert.ok(get(file, 'error'));
      file.upload().then(null, (error) => {
        assert.ok(error);
        done();
      });
    }
  };
  var uploader = queue.configure();
  uploader.Error(uploader, {
    file: {
      id: 'test',
      name: 'test-filename.jpg',
      size: 2000,
      percent: 0
    }
  });
});

test('responses are converted to the content-type no matter its casing', function (assert) {
  let queue = UploadQueue.create();
  let response = queue.parseResponse({
    status: 204,
    response: '<ResponseStatus>204</ResponseStatus>',
    responseHeaders: 'content-type: text/xml'
  });

  assert.equal(response.status, 204);
  assert.deepEqual(response.headers, {
    'content-type': 'text/xml'
  });

  let status = response.body.getElementsByTagName('ResponseStatus')[0]
                            .childNodes[0].nodeValue;
  assert.equal(status, '204');
});

test('response headers with numbers are still properly handled by parseResponse', function (assert) {
  let queue = UploadQueue.create();
  let response = queue.parseResponse({
    status: 204,
    response: '<ResponseStatus>204</ResponseStatus>',
    responseHeaders: 'content-type: text/xml\r\nx-some-header-2: abc'
  });

  assert.deepEqual(response.headers, {
    'content-type': 'text/xml',
    'x-some-header-2' : 'abc'
  });
});

test(".configureUpload should call stop when file is not ready (no settings)", function(assert) {
  const MockFile = Ember.Object.extend({});

  const uploader = Ember.Object.extend({
    stopCallCount: 0,

    stop() {
      this.incrementProperty('stopCallCount');
    }
  }).create();

  const fileToUpload1 = {id: 1};
  const fileToUpload2 = {id: 2};
  const queue = UploadQueue.create({
      settings: {}
  });
  const file1 = MockFile.create({uploader, queue, file: fileToUpload1});
  const file2 = MockFile.create({uploader, queue, file: fileToUpload2});

  queue.pushObject(file1);
  queue.pushObject(file2);

  // configure file that is not ready
  let result = queue.configureUpload(uploader, file1);
  assert.equal(uploader.get('stopCallCount'), 1, 'should call upoader.stop for file without settings');
  assert.equal(result, false, 'should return false to prevent upload');

  // setup file
  file1.set('settings', {});

  // try again same file, this time configured
  result = queue.configureUpload(uploader, file1);
  assert.equal(uploader.get('stopCallCount'), 1, 'should not call upoader.stop for file with settings');
  assert.equal(result, undefined, 'should not return anything');

  // configure already setup file
  file2.set('settings', {});
  result = queue.configureUpload(uploader, file2);
  assert.equal(uploader.get('stopCallCount'), 1, 'should not call upoader.stop for file with settings');
  assert.equal(result, undefined, 'should not return anything');
});
