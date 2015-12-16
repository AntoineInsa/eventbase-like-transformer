var likes = require('./index.js');

// Simulate AWS lambda context
var context = {
    succeed: function (result) {
        console.log('------------');
        console.log('Context succeed');
        console.log(result);
    },
    done: function (err, result) {
        console.log('------------');
        console.log('Context done');
        console.log('error:', err);
        console.log(result);
    }
};

// Simulate dates
formatDate = function(date) {
  date = date || new Date()
  return date.toISOString().replace(/\.\d{3}/,'')
}

currentDate = function(offset) {
  offset = offset || 0
  now = new Date()
  return formatDate(new Date(now.getTime() + offset*60000))
}

var offset = 0

// Simulated S3 bucket events
var eventTemplate = {
  'api_host': 'attendease.com',
  'event_id': 'eventbase',
  'attendease_token': 'this-is-a-secret-attendee-token',
  'schedule_list': []
};

// Advanced events
var template = {
  'api_host': 'attendease.com',
  'event_id': 'eventbase',
  'token': 'this-is-a-secret-attendee-token',
  'object1': 'object1_id',
  'object2': 'object2_id',
  'version': currentDate(-1.1)
}

var events = {
  'firstSync' : {
    'api_host': template.api_host,
    'event_id': template.event_id,
    'attendease_token': template.token,
    'schedule_list': []
  },
  'secondSync' : {
    'api_host': template.api_host,
    'event_id': template.event_id,
    'attendease_token': template.token,
    'version': currentDate(-1),
    'schedule_list': []
  },
  'likeOneUnlikeTwo' : {
    'api_host': template.api_host,
    'event_id': template.event_id,
    'attendease_token': template.token,
    'version': template.version,
    'schedule_list': [
      // like one
      {'object_id': template.object1,
      'timestamp': currentDate(0),
      'value': 1},
      // unlike two
      {'object_id': template.object2,
      'timestamp': currentDate(0),
      'value': 0}]
  },
  'unlikeOneLikeTwo' : {
    'api_host': template.api_host,
    'event_id': template.event_id,
    'attendease_token': template.token,
    'version': template.version,
    'schedule_list': [
      // unlike one
      {'object_id': template.object1,
      'timestamp': currentDate(0),
      'value': 0},
      // like two
      {'object_id': template.object2,
      'timestamp': currentDate(0),
      'value': 1}]
  },
  'likeAndUnlikeOne' : {
    'api_host': template.api_host,
    'event_id': template.event_id,
    'attendease_token': template.token,
    'version': template.version,
    'schedule_list': [
      // like one
      {'object_id': template.object1,
      'timestamp': currentDate(-0.1),
      'value': 1},
      // and unlike it after
      {'object_id': template.object1,
      'timestamp': currentDate(0),
      'value': 0}]
  }
}

// var event = eventTemplate
var event = events['firstSync']

// Call the Lambda function
likes.handler(event, context);
