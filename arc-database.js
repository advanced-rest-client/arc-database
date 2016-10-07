(function() {
  'use strict';

  class ArcDatabase {

    beforeRegister() {
      this.is = 'arc-database';
      this._eventTarget = null;
      this.properties = {
        db: {
          type: Object,
          notify: true
        },
        /**
         * Name of the storage to initialize
         */
        store: String,
        // Adapter to use. Indexeddb by default.
        adapter: {
          type: String,
          value: 'idb'
        },
        /**
         * The indexes to be set for the datastore.
         * Indexes will change depending on the store name. If the store name is unknown then
         * `error` event will be fired.
         */
        indexes: {
          type: Array,
          readOnly: true
        },
        // A selector passed to `<app-pouchdb-query>.selector`
        querySelector: String,
        // An array of fields passed to `<app-pouchdb-query>.fields`
        queryFields: Array,
        // An array of fields passed to `<app-pouchdb-query>.sort`
        querySort: Array,
        // The results of the query, if any.
        queryResult: {
          type: Array,
          notify: true
        },
        /**
         * The maximum number of documents that can be returned. The default (0) specifies
         * no limit.
         */
        queryLimit: {
          type: Number,
          value: 0
        },
        /**
         * The number of documents to skip before returning results that match the query.
         * In other words, the offset from the beginning of the of the result set to start at.
         */
        querySkip: {
          type: Number,
          value: 0
        }
      };
    }

    get observers() {
      return [
        '_storeChanged(store)',
        '_queryResultChanged(queryResult.*)'
      ];
    }

    // index definitions for the `requests`
    get requests() {
      return [{
        'fields': ['currentSaved.url', 'currentSaved.method',
          'currentSaved.method', 'currentSaved.url'
        ]
      }, {
        'fields': ['currentHistory.url', 'currentHistory.method',
          'currentHistory.method', 'currentHistory.url'
        ]
      }, {
        // Type of the request: saved, drive, history
        'fields': ['type']
      }, {
        // Request name, can be empty.
        'fields': ['name']
      }, {
        // Legacy project ID.
        'fields': ['legacyProject']
      }];
    }

    get harIndex() {
      return [{
        'fields': ['headers']
      }, {
        'fields': ['payload']
      }, {
        'fields': ['url']
      }, {
        'fields': ['method']
      }, {
        'fields': ['response']
      }];
    }

    get ramlData() {
      return [{
        'fields': ['name']
      }];
    }

    get ramlIndex() {
      return [{
        'fields': ['ramlId']
      }, {
        'fields': ['headers']
      }, {
        'fields': ['payload']
      }, {
        'fields': ['url']
      }, {
        'fields': ['method']
      }, {
        'fields': ['queryParameters']
      }, {
        'fields': ['uriParameters']
      }];
    }

    get logs() {
      return [{
        'fields': ['time', 'type']
      }];
    }

    get variables() {
      return [{
        'fields': ['enabled', 'scope']
      }];
    }

    get environments() {
      return [{
        'fields': ['enabled']
      }];
    }

    attached() {
      this._eventTarget = Polymer.dom(this).host || document;
      this.listen(
        this._eventTarget,
        'arc-database-query',
        '_databaseQuery');
    }
    detached() {
      this.unlisten(
        this._eventTarget,
        'arc-database-query',
        '_databaseQuery');
    }

    _databaseQuery(e) {
      var detail = e.detail;
      if (detail.selector) {
        this.set('selector', detail.selector);
      }
      if (detail.fields) {
        this.set('queryFields', detail.fields);
      }
      if (detail.sort) {
        this.set('querySort', detail.sort);
      }
      if (detail.limit) {
        this.set('queryLimit', detail.limit);
      }
      if (detail.skip) {
        this.set('querySkip', detail.skip);
      }
      detail.result = new Promise((resolve, reject) => {
        this.__eventQueryResolver = resolve;
        this.__eventQueryRejected = reject;
      });
      this.query();
    }

    _storeChanged(store) {
      if (!store) {
        this._setIndexes([]);
        return;
      }
      if (!(store in this)) {
        return this.fire('error', new Error(`The store ${store} is unknown.`));
      }
      var indexes = this[store];
      if (indexes) {
        this._setIndexes(indexes);
      } else {
        return this.fire('error', new Error(`Indexes for ${store} is invalid.`));
      }
    }

    _queryResultChanged() {
      if (this.__eventQueryResolver) {
        this.__eventQueryResolver(this.queryResult);
        this.__eventQueryResolver = undefined;
        this.__eventQueryRejected = undefined;
      }
      this.fire('query-result', {
        value: this.queryResult
      });
    }

    query() {
      this.$.query.refresh();
    }
  }
  Polymer(ArcDatabase);
})();
