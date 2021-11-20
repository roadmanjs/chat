
<p align="center">
  <h1 align="center"> Roadman - for chat and groups </h1>
</p>


## A Roadman for chat and groups, using UserType from 'auth'

### How to use
```
yarn add @roadmanjs/auth
```

app.ts
```ts
import roadman from 'roadman';
import {AuthResolvers} from '@roadmanjs/auth';
import {ChatResolvers} from '@roadmanjs/chat';

await roadman({
  resolvers: [...AuthResolvers, ...ChatResolvers, ...MyOtherResolvers]
});
```

#### Env required
```sh
DEBUG=roadman*

# Firebase service account json string
FIREBASE_SA={"firebase admin service account": ""}

# Couchbase envs
COUCHBASE_URL= 
COUCHBASE_BUCKET=
COUCHBASE_USERNAME= 
COUCHBASE_PASSWORD= 

# Any random ass access token generator secrets
ACCESS_TOKEN_SECRET=xxxxx
REFRESH_TOKEN_SECRET=xxxx
```
