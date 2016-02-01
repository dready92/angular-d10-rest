'use strict';

import D10RestEvent from './D10RestEvent';

function getRestEventName() {
  return 'd10:rest';
}

function getEventName(action) {
  return getRestEventName() + ':' + action;
}

function toSuccessName(eventName) {
  return eventName + ':success';
}

function toErrorName(eventName) {
  return eventName + ':error';
}

function broadcastStart(pubsub, action, data) {
  let eventName = getEventName(action);
  let restEventName = getRestEventName();
  let evt = new D10RestEvent(action, data);

  pubsub.$broadcast(restEventName, evt);
  pubsub.$broadcast(eventName, evt);

  return evt;
}

function broadcastSuccessOrError(pubsub, action, evt, promise) {
  let eventName = getEventName(action);
  let restEventName = getRestEventName();

  return promise.then(function (response) {
    evt.setResponse(response);
    pubsub.$broadcast(toSuccessName(eventName), evt);
    pubsub.$broadcast(toSuccessName(restEventName), evt);

    return response;
  }, function (error) {
    evt.setError(error);
    pubsub.$broadcast(toErrorName(eventName), evt);
    pubsub.$broadcast(toErrorName(restEventName), evt);
    throw error;
  });
}

export default function (angular, http, pubsub) {

  class D10API {
    constructor (baseUrl) {
      this.setBaseUrl(baseUrl ? baseUrl : 'http://10er10.com/');
    }

    setBaseUrl (baseUrl) {
      this.baseUrl = baseUrl;
    }

    getApiRoot () {
      return this.baseUrl + 'api/';
    }

    getEndPoint (segments) {
      let suffix;

      if (angular.isArray(segments)) {
        suffix = segments.join('/');
      } else {
        suffix = segments;
      }

      return this.getApiRoot() + suffix;
    }

    login (username, password) {
      let data = {
        username: username,
        password: password
      };
      let action = 'login';
      let evt = broadcastStart(pubsub, action, data);
      let promise = http({
        url: this.getEndPoint('session'),
        method: 'POST',
        data: data
      });

      return broadcastSuccessOrError(pubsub, action, evt, promise);
    }

    /*
    * startkey: ["02 - The Medallion Calls","Klaus Badelt & Hans Zimmer"]
    * startkey_docid: aa1937q8ub2ah6m1r947q7
    *
    */
    listSongsSortedByTitle(startkey, startkey_docid) {
      let params;

      if (startkey) {
        if (!angular.isArray(startkey)) {
          throw new Error('getSongsSortedByTitle: startkey should be an array');
        } else if (!startkey_docid) {
          throw new Error('getSongsSortedByTitle: startkey_docid should be specified when startkey is specified');
        }
        params = {
          startkey: startkey,
          startkey_docid: startkey_docid
        };
      }

      let action = 'listSongsSortedByTitle';
      let evt = broadcastStart(pubsub, action, params);
      let promise = http({
        url: this.getEndPoint(['list', 'titles']),
        method: 'POST',
        params: params
      });

      return broadcastSuccessOrError(pubsub, action, evt, promise);
    }

    getUserinfos () {
      let action = 'userinfos';
      let evt = broadcastStart(pubsub, action);
      let promise = http({
        url: this.getEndPoint(action),
        method: 'GET'
      });

      return broadcastSuccessOrError(pubsub, action, evt, promise);
    }
  }

  return new D10API();
}
