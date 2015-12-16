formatDate = function(date) {
  date = date || new Date()
  return date.toISOString().replace(/\.\d{3}/,'')
}

convertEventbaseToAttendeaseLikes = function(eventbaseLikes) {
  var attendeaseLikes = {
    'like':[],
    'unlike':[]
  }

  for (i = 0; i < eventbaseLikes.schedule_list.length; i++) {
    var like = eventbaseLikes.schedule_list[i]
    attendeaseLike = {
      "type"      : 'session',
      "id"        : like.object_id,
      "timestamp" : like.timestamp
    }
    if (like.value == "1") {
      attendeaseLikes.like.push(attendeaseLike)
    }
    else {
      attendeaseLikes.unlike.push(attendeaseLike)
    }
  }

  return attendeaseLikes
}

convertAttendeaseToEventbaseLikes = function(attendeaseLikes, callback) {
  var eventbaseLikes = {
    'version':formatDate(new Date()),
    'schedule_list':[]
  }

  // Likes
  for (i = 0; i < attendeaseLikes.likes.length; i++) {
    var like = attendeaseLikes.likes[i]
    if (like.type == 'session') {
      eventbaseLike = {
        "object_id" : like.id,
        "value"     : "1",
        "timestamp" : like.timestamp
      }
      eventbaseLikes.schedule_list.push(eventbaseLike)
    }
  }

  // Unlikes
  for (i = 0; i < attendeaseLikes.unlikes.length; i++) {
    var like = attendeaseLikes.unlikes[i]
    if (like.type == 'session') {
      eventbaseLike = {
        "object_id" : like.id,
        "value"     : "0",
        "timestamp" : like.timestamp
      }
      eventbaseLikes.schedule_list.push(eventbaseLike)
    }
  }

  callback(eventbaseLikes)
}

mySimpleHttps = function(options,success,error) {
  var https = require('https')

  var postOptions = {
    hostname: options.hostname,
    path: options.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': options.body.length
    }
  };

  var req = https.request(postOptions, function(res) {
    res.setEncoding('utf8');

    var body = ''
    res.on('data', function(d) {
      body += d
    });

    res.on('end', function() {
      if (res.statusCode != '200')
      {
        error({
          'status':res.statusCode,
        })
      }
      else {
        body = JSON.parse(body)
        success(body)
      }
    })

  })

  req.on('error', function(e) {
    error(e)
  })

  req.write(options.body);
  req.end()
}

postLikes = function(event,context,callback) {
  var postData = {
    'attendee_token':event.attendease_token,
    'since':event.version,
    'unlikes':true,
    'like':clientLikes.like,
    'unlike':clientLikes.unlike
  }

  var options = {
    hostname: event.event_id + '.' + event.api_host,
    path: '/api/v2/likes.json',
    body: JSON.stringify(postData)
  }

  postSuccess = function(body) {
    // console.log("Client likes")
    // console.log(clientLikes)
    // console.log("Server likes")
    // console.log(body)

    callback(body, context)
  }

  postError = function(e) {
    console.log('Error')
    console.log(e)
    context.done(null, e);
  }

  mySimpleHttps(options, postSuccess, postError)
}

convertAndFinish = function(result, context)
{
  convertAttendeaseToEventbaseLikes(result, function(converted){
    context.succeed(converted);
  })
}

// ---- Main ----
exports.handler = function(event, context) {
  clientLikes = convertEventbaseToAttendeaseLikes(event)
  postLikes(event,context,convertAndFinish)
}
