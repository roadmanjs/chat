import 'dotenv/config';

import {RoadMan, RoadmanBuild} from '@roadmanjs/core';
import {UserAuthResolver, UserResolver, UserResolverPublic} from './user';

/**
 * An auth roadman using a UserType model in Couchbase and firebase-auth
 * @param RoadmanBuild
 */
export const authRoadman: RoadMan = async (args: RoadmanBuild): Promise<RoadmanBuild> => {
    return args;
};

export const getAuthResolvers = () => [UserAuthResolver, UserResolverPublic, UserResolver];

export default authRoadman;
