import ChatConvoModel, {
    ChatConvo,
    ChatConvoModelName,
    ChatConvoType,
} from '../models/ChatConvo.model';
import {connectionOptions, createUpdate} from '@roadmanjs/couchset';

import {awaitTo} from '@stoqey/client-graphql';
import isEmpty from 'lodash/isEmpty';
import {log} from '@roadmanjs/logs';

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
            return ChatConvoModel.parse({
                ...convo,
                members,
                lastMessage,
                owner,
            });
        });

        return dataToSend[0];
    } catch (error) {
        log('error getting chat messages', error);
        return null;
    }
};
