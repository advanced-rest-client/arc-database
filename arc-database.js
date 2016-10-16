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

      get savedRequests() {
        return [{
          'fields': ['name', 'method', 'url', 'legacyProject']
        }];
      }

      get historyRequests() {
        return [{
          'fields': ['method', 'url']
        }];
      }

      get environments() {
        return [{
          'fields': ['enabled']
        }];
      }

      attached() {
        this._eventTarget = Polymer.dom(this).host || document;
        this.listen(this._eventTarget, 'arc-database-query', '_databaseQuery');
        this.listen(this._eventTarget, 'arc-database-insert', '_databaseInsert');
      }

      detached() {
        this.unlisten(this._eventTarget, 'arc-database-query', '_databaseQuery');
        this.unlisten(this._eventTarget, 'arc-database-insert', '_databaseInsert');
      }

      _databaseQuery(e) {
        var detail = e.detail;
        if (!detail.store || !this.store || this.store !== detail.store) {
          return;
        }
        e.stopImmediatePropagation();
        e.preventDefault();
        if (detail.selector) {
          this.set('querySelector', detail.selector);
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

      _databaseInsert(event) {
        var detail = event.detail;
        if (!detail.store || !this.store || this.store !== detail.store) {
          return;
        }
        event.stopImmediatePropagation();
        event.preventDefault();
        detail.result = this._eventInsert(detail.docs);
      }

      _eventInsert(docs) {
        if (docs instanceof Array) {
          return this.db.bulkDocs(docs);
        }
        return this.db.put(docs);
      }

      _storeChanged(store) {
        if (!store) {
          this._setIndexes([]);
          return;
        }
        var indexes;
        switch (store) {
          case 'history-data': indexes = []; break;
          case 'saved-requests': indexes = this.savedRequests; break;
          case 'history-requests': indexes = this.historyRequests; break;
          case 'legacy-projects': indexes = []; break;
          case 'logs': indexes = []; break;
          case 'external-requests': indexes = this.savedRequests; break;
          case 'auth-data': indexes = []; break;
          case 'cookies': indexes = []; break;
          case 'variables': indexes = []; break;
          case 'url-history': indexes = []; break;
          default:
            if (!(store in this)) {
              return this.fire('error', new Error(`The store ${store} is unknown.`));
            }
            indexes = this[store];
        }

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
