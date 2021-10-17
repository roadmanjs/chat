
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
FIREBASE_SA={"firebase admmin service account": ""}

// Couchbase envs
```
