import {Field, ObjectType} from 'couchset';
import {GraphQLBoolean, GraphQLList, GraphQLObjectType, GraphQLString} from 'graphql';
import {Request, Response} from 'express';

import {RedisPubSub} from 'graphql-redis-subscriptions';

export {ResType, GeoType} from 'couchset';

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

export const getPagination = <T>(c: T): any => {

    const Pagination = new GraphQLObjectType({
        name: `${(c as any).name}Pagination`,
        fields: () => ({
            items: {type: new GraphQLList(c as any)},
            hasNext: {type: GraphQLBoolean},
            params: {type: GraphQLString}, // TODO to GraphQLJSON
        }),
    });

    return Pagination;
};

// export const getPagination = <T>(c: T): any => {
//     @Object(`${(c as any).name}Pagination`)
//     class Pagination {
//         @Field(() => [c], {nullable: true})
//         items: [typeof c];

//         @Field(() => Boolean, {nullable: true})
//         hasNext?: boolean;

//         // @Field(() => GraphQLJSON, {nullable: true})
//         // params?: typeof GraphQLJSON;
//     }
//     return Pagination;
// };
