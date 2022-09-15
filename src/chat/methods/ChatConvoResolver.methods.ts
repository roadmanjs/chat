import ChatConvoModel, {
    ChatConvo,
    ChatConvoModelName,
    ChatConvoType,
} from '../models/ChatConvo.model';
import {
    createAConvoAndReturnIt,
    createChatConvoType,
    getChatConvoById,
} from '../methods/ChatConvo.methods';
import {identity, isEmpty, pickBy} from 'lodash';

import {ChatResType} from '../../shared/ContextType';
import {awaitTo} from '@stoqey/client-graphql';
import {connectionOptions} from '@roadmanjs/couchset';
import {log} from '@roadmanjs/logs';

export const chatConvoById = async (id: string): Promise<ChatConvo> => {
    try {
        const chatConvo = await getChatConvoById(id);

        if (chatConvo) {
            return chatConvo;
        }
        throw new Error('error getting chatconvo');
    } catch (error) {
        log('error getting chat messages', error);
        return null;
    }
};

interface ChatConvoArgs {
    owner: string;
    sortArg?: string;
    before: Date;
    after: Date;
    limit: number;
}

/**
 * Get User Chat Convo Paginated
 * public=false
 * @param args
 * @returns
 */
export const chatConvo = async (
    args: ChatConvoArgs
): Promise<{items: ChatConvo[]; hasNext: boolean; params: any}> => {
    const {owner, before, after, limit: limitArg} = args;
    const bucket = connectionOptions.bucketName;
    const sign = before ? '<=' : '>=';
    // const sort = sortArg || 'DESC';
    const time = new Date(before || after);
    const limit = limitArg || 10;
    const limitPassed = limit + 1;

    const copyParams = pickBy(
        {
            owner,
            before,
            after,
            limit,
        },
        identity
    );

    try {
        const query = `
        SELECT *
        FROM \`${bucket}\` convo
            JOIN \`${bucket}\` owner
            ON KEYS convo.owner
            NEST \`${bucket}\` members
            ON KEYS convo.members
            LEFT JOIN \`${bucket}\` lastMessage
            ON KEYS convo.lastMessage
            
            WHERE convo._type = "${ChatConvoModelName}"
            AND convo.owner = "${owner}"
            AND convo.updatedAt ${sign} "${time.toISOString()}"
            ORDER BY convo.updatedAt DESC
            LIMIT ${limitPassed};
        `;

        const [errorFetching, data = []] = await awaitTo(
            ChatConvoModel.customQuery<any>({
                limit,
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
            const {convo, lastMessage, members, owner} = d;
            return ChatConvoModel.parse({
                ...convo,
                members,
                lastMessage,
                owner,
            });
        });

        return {items: dataToSend, params: copyParams, hasNext};
    } catch (error) {
        log('error getting chat convos', error);
        return {items: [], hasNext: false, params: copyParams};
    }
};

export const createChatConvo = async (args: ChatConvoType): Promise<ChatResType> => {
    try {
        // If updating
        const {members = [], group = false, owner, ...otherArgs} = args;

        const [errorCreatingConvo, createdChatConvo = []] = await awaitTo(
            createChatConvoType({
                members,
                group,
                ...otherArgs,
            })
        );

        if (errorCreatingConvo) {
            throw errorCreatingConvo;
        }

        let convo = createdChatConvo[0];
        if (owner) {
            const selected = createdChatConvo.find((convo) => convo.owner === owner);
            if (selected) {
                convo = selected;
            }
        }

        return {success: true, data: convo};
    } catch (err) {
        console.error(err && err.message, err);
        return {success: false, message: err && err.message};
    }
};

export const startConvo = async (args: ChatConvoType): Promise<ChatResType> => {
    try {
        // If updating
        const {members = [], owner} = args;

        const limit = 1;

        const bucket = connectionOptions.bucketName;

        const queryExisting = `
            SELECT * FROM \`${bucket}\` convo

            JOIN \`${bucket}\` owner
            ON KEYS convo.owner
            NEST \`${bucket}\` members
            ON KEYS convo.members
            LEFT JOIN \`${bucket}\` lastMessage
            ON KEYS convo.lastMessage
            
            WHERE ANY  v IN convo.members SATISFIES v = "${members[0]}" END
            AND  ANY  v IN convo.members SATISFIES v = "${members[1]}" END
            AND convo.owner = "${owner}"
            LIMIT 1;
        `;

        const [errorGettingExisting, existingConvos = []] = await awaitTo(
            ChatConvoModel.customQuery({
                query: queryExisting,
                limit,
                params: {
                    limit,
                    members,
                },
            })
        );

        if (errorGettingExisting) {
            throw errorGettingExisting;
        }

        const [convos = []] = existingConvos;

        if (!isEmpty(convos)) {
            const dataToSend = convos.map((d: any) => {
                const {convo, lastMessage, members, owner} = d;
                return ChatConvoModel.parse({
                    ...convo,
                    members,
                    lastMessage,
                    owner,
                });
            });

            return {success: true, data: dataToSend[0]};
        } else {
            // create a new convo and send it to user
            const [errorCreatingConvo, createdConvo] = await awaitTo(createAConvoAndReturnIt(args));
            if (errorCreatingConvo) {
                throw errorCreatingConvo;
            }

            const createdId = createdConvo && createdConvo.id;
            const chatConvo = await getChatConvoById(createdId as any);
            if (chatConvo) {
                return {success: true, data: chatConvo};
            }
            return {success: true, data: createdConvo};
        }
    } catch (err) {
        console.error(err && err.message, err);
        return {success: false, message: err && err.message};
    }
};

export const startPublicConvo = async (id: string): Promise<ChatConvo> => {
    const newPublicConvo: ChatConvoType = {
        public: true,
        convoId: id,
        group: true,
        owner: 'system',
        members: ['system'],
    };

    const createConvos = await createChatConvo(newPublicConvo);

    return createConvos.data;
};
