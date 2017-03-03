import Ember from 'ember';
import UploadQueue from 'ember-plupload/system/upload-queue';
import File from 'ember-plupload/system/file';
import {
  module,
  test
} from 'qunit';

module('File', {
});

test(".upload - it will call its uploader's start", function(assert) {
  assert.expect(2);

  const uploader = Ember.Object.extend({
    startCallCount: 0,

    start() {
      this.incrementProperty('startCallCount');
    }
  }).create();

  const fileToUpload1 = {id: 1};
  const fileToUpload2 = {id: 2};
  const queue = UploadQueue.create();
  const file1 = File.create({uploader, queue, file: fileToUpload1});
  const file2 = File.create({uploader, queue, file: fileToUpload2});

  queue.pushObject(file1);
  queue.pushObject(file2);

  file1.upload('www.example.com');
  assert.equal(uploader.get('startCallCount'), 1, 'first file called #start');

  file2.upload('www.example.com');
  assert.equal(uploader.get('startCallCount'), 2, 'second file called #start');
});
