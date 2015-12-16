var likes = require('./eventbase-likes-transformer.js');

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

// Simulated S3 bucket event
var event = {
  'api_host': 'localhost.attendease.com',
  'event_id': 'eventbase',
  'attendee_token': 'this-is-a-secret-token',
  //'version': '2014-01-01T15:22:55Z',
  'schedule_list': []
};

// Call the Lambda function
likes.handler(event, context);
