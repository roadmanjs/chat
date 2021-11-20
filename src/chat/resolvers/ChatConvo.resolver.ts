import {
    Resolver,
    Mutation,
    Arg,
    Query,
    Subscription,
    Root,
    UseMiddleware,
} from 'type-graphql';
import {awaitTo} from '@stoqey/client-graphql';
import {getPagination} from '@roadmanjs/couchset';
import _get from 'lodash/get';
import _, {identity, isEmpty, pickBy} from 'lodash';
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
import {connectionOptions} from '@roadmanjs/couchset';
import {isAuth} from '@roadmanjs/auth';
import { ResType } from '../../shared/ContextType';

const ConvoPagination = getPagination(ChatConvo);

@Resolver()
export class ChatConvoResolver {
    // Only admins
    @Subscription(() => [String], {
        topics: ChatConvo.name, // or dynamic topic function
        filter: ({payload, args}) => args.convoId === payload.convoId,
    })
    onChatConvo(
        @Root() data: {convoId: string; message: string},
        // @Arg('convoId') convoId: string
    ): String[] {
        return [data.message];
    }

    @Query(() => ChatConvo)
    @UseMiddleware(isAuth)
    async chatConvoById(@Arg('id') id: string): Promise<ChatConvo | null> {
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
        @Arg('owner') owner: string,
        @Arg('before', {nullable: true}) before: Date,
        @Arg('after', {nullable: true}) after: Date,
        @Arg('limit', {nullable: true}) limit = 10
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
            const time = before || after;

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

    @Mutation(() => ResType)
    @UseMiddleware(isAuth)
    async createChatConvo(@Arg('args') args: ChatConvoType): Promise<ResType> {
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

    @Mutation(() => ResType)
    @UseMiddleware(isAuth)
    async startConvo(@Arg('args') args: ChatConvoType): Promise<ResType> {
        try {
            // If updating
            const {members = [], group = false, owner} = args;

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

            const [convos = [], pagination] = existingConvos;

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
