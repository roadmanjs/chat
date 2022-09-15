import 'reflect-metadata';
import 'dotenv/config';

import {ChatConvoResolver, ChatMessageResolver} from './chat/resolvers';
import {RoadMan, RoadmanBuild} from '@roadmanjs/core';

import {configureFirebase} from '@roadmanjs/firebase-admin';
import ChatConvoPublicResolver from './chat/resolvers/ChatConvo.public.resolver';

/**
 * A roadman for chat and groups, using UserType from 'auth'
 * @param RoadmanBuild
 */
export const chatRoadman: RoadMan = async (args: RoadmanBuild): Promise<RoadmanBuild> => {
    await configureFirebase();
    return args;
};

export const getChatResolvers = () => [
    ChatConvoResolver,
    ChatMessageResolver,
    ChatConvoPublicResolver,
];

export default chatRoadman;
