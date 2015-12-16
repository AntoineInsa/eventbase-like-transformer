// ---- Definitions ----

var environment = 'preview'

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
      "rating"    : like.value,
      "timestamp" : like.timestamp
    }
    if (like.value) {
      attendeaseLikes.like.push(attendeaseLike)
    }
    // if null or 0
    else {
      attendeaseLikes.unlike.push(attendeaseLike)
    }
  }

  return attendeaseLikes
}

convertAttendeaseToEventbaseLikes = function(attendeaseLikes) {
  var eventbaseLikes = {
    'version':currentDate(),
    'schedule_list':[]
  }

  // Likes
  for (i = 0; i < attendeaseLikes.likes.length; i++) {
    var like = attendeaseLikes.likes[i]
    if (like.type == 'session') {
      eventbaseLike = {
        "object_id" : like.id,
        "value"     : 1,
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
        "value"     : null,
        "timestamp" : like.timestamp
      }
      eventbaseLikes.schedule_list.push(eventbaseLike)
    }
  }

  return eventbaseLikes
}

mySimpleRequest = function(options,success,error) {
  var request = require('request')

  request(options, function (e, res, body) {
    if (e) {
      console.log('error')
      error(e)
    }
    console.log('succes')
    success(body)
  })

}

mySimpleHttps = function(options,success,error) {

  var https = require('https')

  var simpleOptions = {
    // hostname: 'encrypted.google.com',
    // path: '/',
    url: options.url,
    method: options.method,
    json: true,
    body: options.body
  };


  var req = https.request(simpleOptions, function(res) {
    console.log("statusCode: ", res.statusCode)
    console.log("headers: ", res.headers)

    var body = ''

    res.on('data', function(d) {
      body += d
    });

    res.on('end', function() {
      body = JSON.parse(body)
      success(body)
    })

    req.on('error', function(e) {
      error(e)
    })

  })
  req.end()
}

postLikes = function(event,context,callback) {
  // 2. POST
  var url = 'https://' + event.event_id + '.' + environment + '.attendease.com/api/v2/likes.json'

  var postData = {
    'attendee_token':event.token,
    'since':event.version,
    'unlikes':true,
    'like':clientLikes.like,
    'unlike':clientLikes.unlike
  }

  var options = {
    url: url,
    method: 'post',
    json: true,
    body: postData
  }

  postSuccess = function(body) {
    // console.log("Client likes")
    // console.log(clientLikes)
    // console.log("Server likes")
    // console.log(body)

    result = callback(body)
    console.log(result)
    context.succeed(result);
  }

  postError = function(e) {
    console.log('Error')
    console.log(e)
    context.succeed({"error":"Could not authenticate you."});
    return
  }

  mySimpleRequest(options, postSuccess, postError)
  // mySimpleHttps(options, postSuccess, postError)
}

// ---- Main ----
exports.handler = function(event, context) {
  clientLikes = convertEventbaseToAttendeaseLikes(event,context)
  postLikes(event,context,convertAttendeaseToEventbaseLikes)
}
