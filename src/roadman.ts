import 'dotenv/config';

import {ChatConvoResolver, ChatMessageResolver} from './chat';
import {RoadMan, RoadmanBuild} from '@roadmanjs/core';

import {configureFirebase} from '@roadmanjs/firebase-admin';

/**
 * An auth roadman using a UserType model in Couchbase and firebase-auth
 * @param RoadmanBuild
 */
export const chatRoadman: RoadMan = async (args: RoadmanBuild): Promise<RoadmanBuild> => {
    await configureFirebase();
    return args;
};

export const getChatResolvers = () => [ChatConvoResolver, ChatMessageResolver];

export default chatRoadman;
