import ChatMessageModel, {
    ChatMessage,
    ChatMessageModelName,
    ChatMessageType,
} from '../models/ChatMessage.model';
import {ChatResType, ContextType} from '../../shared/ContextType';
import {connectionOptions, createUpdate} from '@roadmanjs/couchset';
import {removeUnreadCount, updateConvoSubscriptions} from '.';

import ChatConvoModel from '../models/ChatConvo.model';
import _get from 'lodash/get';
import {awaitTo} from '@stoqey/client-graphql';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';
import pickBy from 'lodash/pickBy';
import {updateConvoLastMessage} from '..';
import {verifyAuthToken} from '@roadmanjs/auth';

export const chatTyping = async (
    ctx: ContextType,
    convoId: string,
    time: Date // just to make the client HOT
): Promise<boolean> => {
    const owner = _get(ctx, 'payload.userId', ''); // loggedIn user

    await updateConvoSubscriptions({
        sender: owner,
        convoId,
        data: {typing: owner, time},
        context: ctx,
    }); // send a typing subscription

    return true;
};

export const getConvoOwnerNAuth = async (
    convoId: string,
    ctx: any
): Promise<{owner: string; isPublic: boolean}> => {
    let isPublic = false;

    try {
        const authorization = _get(ctx, 'req.headers.authorization', '');
        const token = authorization.split(' ')[1];

        const convo = await ChatConvoModel.pagination({
            where: {
                convoId,
            },
        });

        if (!convo.length) {
            throw new Error('conversation not found');
        }

        const selectedConvo = convo[0];
        isPublic = selectedConvo.isPublic;

        if (isPublic) {
            return {owner: selectedConvo.owner, isPublic};
        }

        if (isEmpty(token)) {
            log('token is empty', token);
            throw new Error('not authorized');
        }

        // throw error if token is not valid
        const payload: any = verifyAuthToken(token);
        return {owner: payload.userId, isPublic};
    } catch (e) {
        console.error(e);
        throw e;
    }
};

interface ChatMessageArgs {
    ctx: ContextType;
    convoId: string;
    sort?: string;
    before: Date;
    after: Date;
    limit?: number;
}

export const chatMessage = async (
    args: ChatMessageArgs
): Promise<{
    items: ChatMessage[];
    hasNext: boolean;
    params: any;
}> => {
    const {ctx, convoId, before, after, limit: limitArg} = args;

    // TODO add sort, by default it's just new to old
    const bucket = connectionOptions.bucketName;
    const sign = before ? '<=' : '>=';
    const time = new Date(before || after);
    const limit = limitArg || 10;
    const limitPassed = limit + 1;

    const copyParams = pickBy(
        {
            convoId,
            before,
            after,
            limit,
        },
        identity
    );

    try {
        const {owner, isPublic} = await getConvoOwnerNAuth(convoId, ctx);

        const query = `
            SELECT *
                FROM \`${bucket}\` chat
                LET owner = (SELECT o.* FROM \`${bucket}\` AS o USE KEYS chat.owner),
                        attachments = (SELECT m.* FROM \`${bucket}\` AS m USE KEYS chat.attachments)
                WHERE chat._type = "${ChatMessageModelName}"
                AND chat.convoId = "${convoId}"
                AND chat.createdAt ${sign} "${time.toISOString()}"
                ORDER BY chat.createdAt DESC
                LIMIT ${limitPassed};
        `;

        const [errorFetching, data = []] = await awaitTo(
            ChatMessageModel.customQuery<any>({
                limit: limitPassed,
                query,
                params: copyParams,
            })
        );

        if (errorFetching) {
            throw errorFetching;
        }

        const [rows = []] = data;

        const hasNext = rows.length > limit;

        if (hasNext) {
            rows.pop(); // remove last element
        }

        const dataToSend = rows.map((d) => {
            const {chat, attachments, owner} = d;
            return ChatMessageModel.parse({
                ...chat,
                attachments,
                owner: owner[0] || null,
            });
        });

        // TODO just add as a queue non-blocking queries
        if (!isPublic) {
            await removeUnreadCount(owner, convoId);
        }

        return {items: dataToSend, params: copyParams, hasNext};
    } catch (error) {
        log('error getting chat messages', error);
        return {items: [], hasNext: false, params: copyParams};
    }
};

export const createChatMessage = async (
    ctx: ContextType,
    args: ChatMessageType
): Promise<ChatResType> => {
    const owner = _get(ctx, 'payload.userId', '');
    try {
        // If updating
        const createdOrUpdate = await createUpdate<ChatMessageType>({
            model: ChatMessageModel,
            data: {
                ...args,
            },
            ...args, // id and owner if it exists
        });

        // Error when creating message
        // update conversation with new lastMessage
        // update message

        if (createdOrUpdate) {
            const message = createdOrUpdate.id;
            const convoId = createdOrUpdate.convoId;

            await updateConvoLastMessage({
                sender: owner,
                convoId,
                lastMessageId: message,
            }); // update all convos

            await updateConvoSubscriptions({
                sender: owner,
                convoId,
                data: {message},
                context: ctx,
            });

            return {success: true, data: createdOrUpdate};
        }

        throw new Error('error creating chat message method ');
    } catch (err) {
        console.error(err && err.message, err);
        return {success: false, message: err && err.message};
    }
};
