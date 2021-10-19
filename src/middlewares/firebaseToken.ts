import * as firebase from 'firebase-admin';

import {MiddlewareFn} from 'couchset';
import {configureFirebase} from '@roadmanjs/firebase-admin';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';

export const FirebaseTokenVerify: MiddlewareFn = async ({args}: any, next) => {
    await configureFirebase();
    const token = (args && args.firebaseToken) || get(args, 'user.firebaseToken', ''); // args.user.firebaseToken;

    if (isEmpty(token)) {
        throw new Error('Token No authorization');
    }

    const verifyToken = (idToken: string): Promise<string | null> => {
        // idToken comes from the client app
        return new Promise((res) => {
            firebase
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const uid = decodedToken.uid;
                    res(uid);
                })
                .catch((error) => {
                    // Handle error
                    log(`Error verifying token ${error && error.token}`);
                    res(null);
                });
        });
    };

    try {
        const verified = await verifyToken(token);

        if (!verified) {
            throw new Error('No authorization, please try again');
        }
    } catch (err) {
        console.log(err);
        return null;
    }
    return next();
};
