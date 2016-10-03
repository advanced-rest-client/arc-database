
`<arc-database>` A database component for advanced rest client

### Example
```
<arc-database></arc-database>
```

## ARC database structure

### ramlData
_id
name :String
specification :Object
importDate :String YYYY-mm-dd
source :Blob

### ramlIndex
_id
ramlId :uuid
headers :String
payload :String
url :String
method :String
queryParameters :Array<String>
uriParameters :Array<String>

### requests
_id
name
type
currentHistory
currentSaved

### harData
_id
requestId
entries
pages

### harIndex
_id
headers
payload
url
method
response
harId
requestId
name
type

### Styling
`<arc-database>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--arc-database` | Mixin applied to the element | `{}`

