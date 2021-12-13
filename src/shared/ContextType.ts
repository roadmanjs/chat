import {Field, ObjectType} from 'couchset';
import {Request, Response} from 'express';

// import { GraphQLJSONObject } from 'graphql-type-json';
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

// export const getPagination = <T>(c: T): any =>
//     new GraphQLObjectType({
//         name: `${(c as any).name}Pagination`,
//         fields: () => ({
//             // items: {type: new GraphQLList(c as any)},
//             hasNext: {type: GraphQLBoolean},
//             params: {type: GraphQLString}, // TODO to GraphQLJSON
//         }),
//     });

export const getPagination = <T>(c: T): any => {
    @ObjectType(`${(c as any).name}Pagination`)
    class Pagination {
        @Field(() => [c], {nullable: true})
        items: [typeof c];

        @Field(() => Boolean, {nullable: true})
        hasNext?: boolean;

        // @Field(type => GraphQLJSONObject, {nullable: true})
        // params?: any;
    }
    return Pagination;
};
