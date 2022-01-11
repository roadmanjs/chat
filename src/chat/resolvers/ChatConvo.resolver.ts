import {Resolver, Mutation, Arg, Query, Subscription, Root, UseMiddleware} from 'type-graphql';
import {awaitTo} from '@stoqey/client-graphql';
import {connectionOptions} from '@roadmanjs/couchset';
import {identity, isEmpty, pickBy} from 'lodash';
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
import {log} from '@roadmanjs/logs';
import {isAuth} from '@roadmanjs/auth';
import {ChatResType, getPagination} from '../../shared/ContextType';

const ConvoPagination = getPagination(ChatConvo);

@Resolver()
export class ChatConvoResolver {
    // Only admins
    @Subscription(() => [String], {
        topics: ChatConvo.name, // or dynamic topic function
        filter: ({payload, args}) => args.convoId === payload.convoId,
    })
    onChatConvo(
        @Root() data: {convoId: string; message: string}
        // @Arg('convoId') convoId: string
    ): String[] {
        return [data.message];
    }

    @Query(() => ChatConvo)
    @UseMiddleware(isAuth)
    async chatConvoById(
        @Arg('id', () => String, {nullable: false}) id: string
    ): Promise<ChatConvo> {
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
    }

    @Query(() => ConvoPagination)
    @UseMiddleware(isAuth)
    async chatConvo(
        @Arg('owner', () => String, {nullable: false}) owner: string,
        @Arg('before', () => Date, {nullable: true}) before: Date,
        @Arg('after', () => Date, {nullable: true}) after: Date,
        @Arg('limit', () => Number, {nullable: true}) limit = 10
    ): Promise<{items: ChatConvo[]; hasNext: boolean; params: any}> {
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
            const bucket = connectionOptions.bucketName;

            const sign = before ? '<=' : '>=';
            const time = new Date(before || after);

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
        LIMIT ${limit};
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

            const [rows = [], options = {hasNext: false, params: copyParams}] = data;

            const dataToSend = rows.map((d) => {
                const {convo, lastMessage, members, owner} = d;
                return ChatConvoModel.parse({
                    ...convo,
                    members,
                    lastMessage,
                    owner,
                });
            });

            return {items: dataToSend, ...options};
        } catch (error) {
            log('error getting chat messages', error);
            return {items: [], hasNext: false, params: copyParams};
        }
    }

    @Mutation(() => ChatResType)
    @UseMiddleware(isAuth)
    async createChatConvo(
        @Arg('args', () => ChatConvoType, {nullable: true}) args: ChatConvoType
    ): Promise<ChatResType> {
        try {
            // If updating
            const {members = [], group = false, owner} = args;

            const [errorCreatingConvo, createdChatConvo = []] = await awaitTo(
                createChatConvoType({
                    members,
                    group,
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

            return {success: true, data: convo};
        } catch (err) {
            console.error(err && err.message, err);
            return {success: false, message: err && err.message};
        }
    }

    @Mutation(() => ChatResType)
    @UseMiddleware(isAuth)
    async startConvo(
        @Arg('args', () => ChatConvoType, {nullable: true}) args: ChatConvoType
    ): Promise<ChatResType> {
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
                const [errorCreatingConvo, createdConvo] = await awaitTo(
                    createAConvoAndReturnIt(args)
                );
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
    }
}

export default ChatConvoResolver;
