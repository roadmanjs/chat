import ChatConvoModel, {
    ChatConvo,
    ChatConvoModelName,
    ChatConvoType,
    chatConvoSelectors,
} from '../models/ChatConvo.model';
import {ChatMessage, ChatMessageModel} from '../models';
import {connectionOptions, createUpdate} from '@roadmanjs/couchset';

import {ContextType} from '../../shared/ContextType';
import {awaitTo} from '@stoqey/client-graphql';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';
import {publishMessageToTopic} from '../../shared/pubsub.utils';

export const createAConvoAndReturnIt = async (newConvo: ChatConvoType): Promise<ChatConvoType> => {
    const {members = [], group = false, owner, ...others} = newConvo;

    const [errorCreatingConvo, createdChatConvo = []] = await awaitTo(
        createChatConvoType({
            ...others,
            members,
            group,
            owner,
        })
    );

    if (errorCreatingConvo) {
        throw errorCreatingConvo;
    }

    let convo = createdChatConvo[0];
    if (owner) {
        const selected = createdChatConvo.find((chat) => chat.owner === owner);
        if (selected) {
            convo = selected;
        }
    }

    return convo;
};

export const createChatConvoType = async (
    props: Partial<ChatConvoType>
): Promise<ChatConvoType[]> => {
    const {members = [], group = false, ...others} = props;

    if (isEmpty(members)) {
        throw new Error('members have to be more than one');
    }

    const defaultConvo: ChatConvoType = {
        ...others,
        members,
        group,
        owner: 'system',
    };

    const isPublicChat = defaultConvo.public;

    if (isPublicChat) {
        const existingPublicChat = await ChatConvoModel.pagination({
            where: {convoId: defaultConvo.convoId},
        });

        if (existingPublicChat && existingPublicChat.length) {
            return existingPublicChat;
        }
    }

    const [errorSystemConvo, createdSystemConvo] = await awaitTo(
        createUpdate<ChatConvoType>({
            model: ChatConvoModel,
            data: defaultConvo,
            ...defaultConvo,
        })
    );

    if (errorSystemConvo) {
        throw errorSystemConvo;
    }

    if (isPublicChat) {
        return [createdSystemConvo];
    }

    // create a convo for each member
    const [errorConvos, convos] = await awaitTo(
        Promise.all(
            members.map((member) =>
                createUpdate<ChatConvoType>({
                    model: ChatConvoModel,
                    data: {
                        ...defaultConvo,
                        owner: member,
                        convoId: createdSystemConvo?.id,
                    },
                    ...defaultConvo,
                    owner: member,
                })
            )
        )
    );

    if (errorConvos) {
        throw errorConvos;
    }

    return convos as ChatConvoType[];
};

export const getChatConvoById = async (id: string): Promise<ChatConvo | null> => {
    try {
        const bucket = connectionOptions.bucketName;

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
      AND convo.id = "${id}"
      LIMIT 1;
    `;

        const [errorFetching, data = []] = await awaitTo(
            ChatConvoModel.customQuery<any>({
                limit: 1,
                query,
                params: {limit: 1, id},
            })
        );

        if (errorFetching) {
            throw errorFetching;
        }

        const [rows = []] = data;

        const dataToSend = rows.map((d) => {
            const {convo, lastMessage, members, owner} = d;
            const lastMessageParsed = ChatMessageModel.parse(lastMessage);
            const chatConvoItem = ChatConvoModel.parse({
                ...convo,
                members,
                owner,
            });
            chatConvoItem.lastMessage = lastMessageParsed;
            return chatConvoItem;
        });

        return dataToSend[0];
    } catch (error) {
        log('error getting chat messages', error);
        return null;
    }
};

interface UpdateConvoLastMessage {
    sender: string;
    convoId: string;
    lastMessageId: string;
}

export const updateConvoLastMessage = async (args: UpdateConvoLastMessage): Promise<boolean> => {
    const {sender, convoId, lastMessageId} = args;
    try {
        // find all convo by convoId
        // add update them all with the new lastMessageId

        const convos: ChatConvoType[] = await ChatConvoModel.pagination({
            select: chatConvoSelectors,
            where: {convoId: {$eq: convoId}},
        });

        if (!isEmpty(convos)) {
            // update convo objects
            const [errorConvos, updatedConvos] = await awaitTo(
                Promise.all(
                    convos.map((convo) => {
                        const update = {
                            ...convo,
                            lastMessage: lastMessageId,
                        };

                        if (convo.owner !== sender) {
                            // if this is not creator, update unread
                            update.unread = (convo.unread || 0) + 1;
                        }

                        return createUpdate<ChatConvoType>({
                            model: ChatConvoModel,
                            data: update,
                            ...convo,
                        });
                    })
                )
            );
            if (errorConvos) {
                throw errorConvos;
            }

            log(
                `updated convos with lastMessage=${lastMessageId}`,
                updatedConvos.map((uc) => uc.id)
            );
        }

        return true;
    } catch (error) {
        return false;
    }
};

interface UpdateConvoSubscriptions {
    context: ContextType;
    sender: string;
    convoId: string;
    data: object;
}

/**
 * Send data to convo expect the sender
 * @param args
 * @returns
 */
export const updateConvoSubscriptions = async (
    args: UpdateConvoSubscriptions
): Promise<boolean> => {
    const {context, sender, convoId, data} = args;

    const publishToMessageTopic = async () => {
        return publishMessageToTopic(context, [ChatMessage.name], {
            convoId,
            owner: sender,
            ...data,
        });
    };

    try {
        // send to message topic
        await publishToMessageTopic();

        // send to convo topics
        const membersConvos: ChatConvoType[] = await ChatConvoModel.pagination({
            select: chatConvoSelectors,
            where: {convoId: {$eq: convoId}, owner: {$neq: sender}},
        });

        if (!isEmpty(membersConvos)) {
            const isPublicChat = compact(membersConvos.map((c) => c.public));

            if (!isEmpty(isPublicChat)) {
                log(`updated subscriptions isPublicChat`);
                return;
            }

            // update sockets, no need for results
            await awaitTo(
                Promise.all(
                    membersConvos.map((convo) => {
                        // Send subscriptions to owners
                        return publishMessageToTopic(context, [ChatConvo.name], {
                            convoId,
                            owner: convo.owner,
                            ...data,
                        }); // update sockets
                    })
                )
            );

            log(
                `updated subscriptions from=${sender} with data=${data}`,
                membersConvos.map((uc) => uc.id)
            );

            // update sockets
        }

        return true;
    } catch (error) {
        return false;
    }
};

export const removeUnreadCount = async (owner: string, convoId: string): Promise<any> => {
    try {
        const convos: ChatConvoType[] = await ChatConvoModel.pagination({
            select: chatConvoSelectors,
            where: {convoId: {$eq: convoId}, owner: {$eq: owner}},
        });

        if (!isEmpty(convos)) {
            const convo = convos[0];
            if (convo.unread > 0) {
                convo.unread = 0; // remove the unread
                await ChatConvoModel.updateById(convo.id, convo, {silent: true}); // do not updatedAt
            }
        }

        return true;
    } catch (err) {
        log(err);
        return false;
    }
};
