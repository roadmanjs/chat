import 'reflect-metadata';

import {couchsetRoadman} from '@roadmanjs/couchset';
import {getChatResolvers} from '.';
import {roadman} from 'roadman';

roadman({
    resolvers: [...getChatResolvers()],
    roadmen: [couchsetRoadman as any],
})
    .then(() => {
        console.log('roadman started');
    })
    .catch((error) => {
        console.error(error);
    });
