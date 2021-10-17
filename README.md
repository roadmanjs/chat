
<p align="center">
  <h1 align="center"> Roadman - Couchbase UserType Model + Firebase Auth </h1>
</p>


## An auth roadman using a UserType model in Couchbase and firebase-auth

### How to use
```
yarn add @roadmanjs/auth
```

app.ts
```ts
import roadman from 'roadman';
import {AuthResolvers} from '@roadmanjs/auth';

await roadman({
  resolvers: [...AuthResolvers, ...MyOtherResolvers]
});
```

also exports, middleswares like, isAuth, or FirebaseToken

#### Env required
```sh
DEBUG=roadman*

# Firebasebase service account json string
FIREBASE_SA={"firebase admmin service account": ""}

# Couchbase envs
COUCHBASE_URL= 
COUCHBASE_BUCKET=
COUCHBASE_USERNAME= 
COUCHBASE_PASSWORD= 

# Access token generator secrets
ACCESS_TOKEN_SECRET=AadsfasdfASDBSADTFGHLWEFDVKAWMERTXC
REFRESH_TOKEN_SECRET=sadfgsdfvsdfvsdafbsdfbsdf
```
