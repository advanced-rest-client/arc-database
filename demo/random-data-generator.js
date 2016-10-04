/* global chance */

'use strict';

var genRequests = () => {
  var urls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => chance.url());
  var urlsLength = urls.length;
  var methods = ['GET', 'POST', 'PUT', 'DELETE'];
  var methodsLength = methods.length;
  var res = [];

  for (let i = 0; i < chance.integer({
      min: 1000,
      max: 2500
    }); i++) {
    let name;
    let type = chance.bool() ? 'saved' : 'history';
    if (type === 'saved') {
      name = chance.sentence({
        words: chance.integer({
          min: 1,
          max: 5
        })
      });
    }
    let url = urls[chance.integer({
      min: 0,
      max: urlsLength - 1
    })];
    let method = methods[chance.integer({
      min: 0,
      max: methodsLength - 1
    })];
    let headers = [];
    for (let j = 0; j < chance.integer({
        min: 0,
        max: 10
      }); j++) {
      headers.push({
        name: 'X-' + chance.word(),
        value: chance.sentence({
          words: 3
        })
      });
    }
    let responseHeaders = [];
    for (let j = 0; j < chance.integer({
        min: 0,
        max: 10
      }); j++) {
      responseHeaders.push({
        name: 'X-' + chance.word(),
        value: chance.sentence({
          words: 3
        })
      });
    }
    let payload = null;
    if (['GET', 'DELETE'].indexOf(method) === -1) {
      payload = chance.paragraph();
    }
    let obj = {
      type: type,
      url: url,
      method: method,
      headers: headers,
      responseHeaders: responseHeaders
    };
    if (payload) {
      obj.payload = payload;
    }
    if (name) {
      obj.name = name;
    }
    res.push(obj);
  }
  return res;
};

var genData = () => {
  var requests = genRequests();
  var urls = {};
  requests.forEach((item) => {
    if (!(item.url in urls)) {
      urls[item.url] = {
        type: item.type,
        hars: []
      };
      if (item.type === 'saved') {
        urls[item.url].name = item.name;
      }
    }

    let d = chance.date();
    let requestObject = {
      'url': item.url,
      'method': item.method,
      'postData': item.payload,
      'headers': item.headers,
      'headersSize': 0,
      'bodySize': 0,
      'cookies': [{
        'name': chance.word(),
        'value': chance.sentence({
          words: 3
        }),
        'path': '/',
        'domain': chance.domain(),
        'expires': d.toISOString(),
        'httpOnly': false,
        'secure': false
      }],
    };
    d = chance.date();
    let responseBody = chance.paragraph();
    var responseObject = {
      'status': 200,
      'statusText': 'OK',
      'cookies': [{
        'name': chance.word(),
        'value': chance.sentence({
          words: 3
        }),
        'path': '/',
        'domain': chance.domain(),
        'expires': d.toISOString(),
        'httpOnly': false,
        'secure': false
      }],
      'headers': item.responseHeaders,
      'content': {
        'size': responseBody.length,
        'compression': 0,
        'mimeType': 'text/html; charset=utf-8',
        'text': responseBody,
        'comment': ''
      },
      'redirectURL': '',
      'headersSize': 0,
      'bodySize': 0
    };

    if (urls[item.url].type === 'saved') {
      urls[item.url].currentSaved = requestObject;
    } else {
      urls[item.url].currentHistory = requestObject;
    }
    urls[item.url].hars.push({
      'time': 50,
      request: requestObject,
      response: responseObject,
      'timings': {
        'blocked': 0,
        'dns': -1,
        'connect': 15,
        'send': 20,
        'wait': 38,
        'receive': 12,
        'ssl': -1
      }
    });
  });
  requests = [];
  for (let url in urls) {
    requests.push(urls[url]);
  }
  return requests;
};
