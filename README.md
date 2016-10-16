
`<arc-database>` A database component for advanced rest client

### Example
```
<arc-database></arc-database>
```

## ARC databases

### history-data
Keeps history (HAR) data. It should not be indexed since it's only to put and keep data.
At least for now. In oposite to the `history-requests` datastore it also keeps response data.

This view can be huge!

### saved-requests
Requests saved by the user.
Index on:
- url
- method
- paylaod
- headers
The name is in the object key as a:
```
url encoded name + '/' url encoded url + '/' + method
```

### legacy-projects
Legacy structure and support will be here for some time more.
There are no indexes for this object store.

### history-requests
All the requests made by the user. It does not contains response data.

Indexes on:
- time
- url
- method
Object key is:
```
url encoded url + '/' + method + '/' + Date.now()
```

### external-requests
Requests saved in the external datastores (Drive).

Indexes on:
- time
- url
- method
Object key is:
```
url encoded name + '/' url encoded url + '/' + method
```

### cookies
Cookies store for socket transport
Main key is
```
domain + '/' + url encoded i.name + '/' + url encoded i.path;
```

### auth-data
Saved credentials for socket transport
Main key:
```
type + '/' + url encoded i.url;
```

### variables
User defined variables.
Keys will be defined later.

