import {
    Resolver,
    Query,
    Mutation,
    Arg,
    UseMiddleware,
    Ctx,
    Subscription,
    Root,
    // Int,
} from 'couchset';
import {awaitTo} from '@stoqey/client-graphql';
import {ContextType, ChatResType, getPagination} from '../../shared/ContextType';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import {log} from '@roadmanjs/logs';
import _get from 'lodash/get';
import {isAuth} from '@roadmanjs/auth';
import ChatMessageModel, {
    ChatMessage,
    ChatMessageModelName,
    ChatMessageType,
    OnChatMessage,
} from '../models/ChatMessage.model';
import {publishMessageToTopic} from '../../shared/pubsub.utils';
import {ChatConvo} from '../models/ChatConvo.model';
import {connectionOptions, createUpdate} from '@roadmanjs/couchset';
import {updateConvoLastMessage} from '..';

const ChatPagination = getPagination(ChatMessage);

@Resolver()
export class ChatMessageResolver {
    @Subscription(() => OnChatMessage, {
        topics: ChatMessage.name,
        filter: ({payload, args}) => args.convoId === payload.convoId,
    })
    onChatMessage(@Root() data: OnChatMessage): OnChatMessage {
        return data;
    }

    @Query(() => Boolean)
    @UseMiddleware(isAuth)
    async chatTyping(
        @Ctx() ctx: ContextType,
        @Arg('convoId', () => String, {nullable: false}) convoId: string,
        @Arg('time', () => Date, {nullable: true}) time: Date // just to make the client HOT
    ): Promise<boolean> {
        const owner = _get(ctx, 'payload.userId', ''); // loggedIn user
        await publishMessageToTopic(ctx, ChatMessage.name, {typing: owner, convoId, time}); // send a typing subscription
        return true;
    }

    @Query(() => ChatPagination)
    @UseMiddleware(isAuth)
    async chatMessage(
        @Arg('convoId', () => String, {nullable: false}) convoId: string,
        //  @Arg('sort', () => String, {nullable: true}) sortArg?: string,
        @Arg('before', () => Date, {nullable: true}) before: Date,
        @Arg('after', () => Date, {nullable: true}) after: Date,
        @Arg('limit', () => Number, {nullable: true}) limitArg
    ): Promise<{
        items: ChatMessage[];
        hasNext: boolean;
        params: any;
    }> {
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

            return {items: dataToSend, params: copyParams, hasNext};
        } catch (error) {
            log('error getting chat messages', error);
            return {items: [], hasNext: false, params: copyParams};
        }
    }

    @Mutation(() => ChatResType)
    @UseMiddleware(isAuth)
    async createChatMessage(
        @Ctx() ctx: ContextType,
        @Arg('args', () => ChatMessageType, {nullable: false}) args: ChatMessageType
    ): Promise<ChatResType> {
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
                // TODO update with new topic after test
                const topicId = ChatConvo.name;
                const message = createdOrUpdate.id;
                const convoId = createdOrUpdate.convoId;
                await publishMessageToTopic(ctx, topicId, {convoId, message}); // update sockets
                await updateConvoLastMessage(convoId, message); // update all convos
                return {success: true, data: createdOrUpdate};
            }

            throw new Error('error creating chat message method ');
        } catch (err) {
            console.error(err && err.message, err);
            return {success: false, message: err && err.message};
        }
    }
}

export default ChatMessageResolver;
