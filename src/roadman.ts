import 'dotenv/config';

import {RoadMan, RoadmanBuild} from '@roadmanjs/core';
import {UserAuthResolver, UserResolver, UserResolverPublic} from './user';

import {configureFirebase} from '@roadmanjs/firebase-admin';

/**
 * An auth roadman using a UserType model in Couchbase and firebase-auth
 * @param RoadmanBuild
 */
export const chatRoadman: RoadMan = async (args: RoadmanBuild): Promise<RoadmanBuild> => {
    await configureFirebase();
    return args;
};

export const getAuthResolvers = () => [UserAuthResolver, UserResolverPublic, UserResolver];

export default chatRoadman;
