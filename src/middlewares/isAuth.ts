import {ContextType, MiddlewareFn} from 'couchset';
import {get as _get, isEmpty} from 'lodash';

import {verify} from 'jsonwebtoken';

export const isAuth: MiddlewareFn<ContextType> = ({context}, next) => {
    const authorization = _get(context, 'req.headers.authorization', '');

    if (isEmpty(authorization)) {
        throw new Error('Not Authenticated');
    }

    try {
        const token = authorization.split(' ')[1];
        const verified = verify(token, process.env.ACCESS_TOKEN_SECRET!);

        // verbose('user is auth', verified);
        /**
       {
        userId: 'xxxxxxx04453',
        iat: 1616303858,
        exp: 1616307458
      }
     */
        context.payload = verified as any;

        // TODO set user object to request
    } catch (err) {
        console.log('not authenticated');
        throw new Error('not authenticated');
    }

    return next();
};
