import {Request, Response} from 'express';

import { RedisPubSub } from 'graphql-redis-subscriptions';

export { ResType, GeoType } from 'couchset';

export interface ContextType {
    req: Request; 
    res: Response;
    payload?: any; 
    pubsub: RedisPubSub;
}

/**
 * GraphQL Types start
 */


 /**
  * ResType
  */


export interface GeoLocationType {
  lat: number;
  lon: number;
}