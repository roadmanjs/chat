import {Field, ObjectType} from 'couchset';
// import { GraphQLObjectType, GraphQLScalarType } from "graphql"
import {Request, Response} from 'express';

import GraphQLJSON from 'graphql-type-json';
import {RedisPubSub} from 'graphql-redis-subscriptions';

export {GeoType} from 'couchset';

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
 * ChatResType
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

@ObjectType()
export class ChatResType {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String, {nullable: true})
    message?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Field((type) => GraphQLJSON, {nullable: true})
    data?: any;
}

export const getPagination = <T>(c: T): any => {
    @ObjectType(`${(c as any).name}Pagination`)
    class Pagination {
        @Field(() => [c], {nullable: true})
        items: [typeof c];

        @Field(() => Boolean, {nullable: true})
        hasNext?: boolean;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Field((type) => GraphQLJSON, {nullable: true})
        params?: any;
    }
    return Pagination;
};
