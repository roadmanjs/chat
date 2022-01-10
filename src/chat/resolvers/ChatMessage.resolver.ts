import {
    Resolver,
    Query,
    Mutation,
    Arg,
    UseMiddleware,
    Ctx,
    // Int,
} from 'couchset';
import {awaitTo} from '@stoqey/client-graphql';
import {ContextType, ChatResType, getPagination} from '../../shared/ContextType';
import identity from 'lodash/identity';
import pickBy from 'lodash/pickBy';
import {log} from '@roadmanjs/logs';
import {isAuth} from '../../middlewares';
import ChatMessageModel, {
    ChatMessage,
    ChatMessageModelName,
    ChatMessageType,
} from '../models/ChatMessage.model';
import {publishMessageToTopic} from '../../shared/pubsub.utils';
import {ChatConvo} from '../models/ChatConvo.model';
import {connectionOptions, createUpdate} from '@roadmanjs/couchset';

const ChatPagination = getPagination(ChatMessage);

@Resolver()
export class ChatMessageResolver {
    @Query(() => ChatPagination)
    @UseMiddleware(isAuth)
    async chatMessage(
        @Arg('convoId', () => String, {nullable: false}) convoId: string,
        @Arg('before', () => Date, {nullable: true}) before: Date,
        @Arg('after', () => Date, {nullable: true}) after: Date,
        @Arg('limit', () => Number, {nullable: true}) limit = 10
    ): Promise<{
        items: ChatMessage[];
        hasNext: boolean;
        params: any;
    }> {
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
            const bucket = connectionOptions.bucketName;
            const sign = before ? '<' : '>';
            const time = new Date(before || after);

            const query = `
      SELECT *
          FROM \`${bucket}\` chat
          LET owner = (SELECT o.* FROM \`${bucket}\` AS o USE KEYS chat.owner),
                  attachments = (SELECT m.* FROM \`${bucket}\` AS m USE KEYS chat.attachments)
          WHERE chat._type = "${ChatMessageModelName}"
          AND chat.convoId = "${convoId}"
          AND chat.createdAt ${sign} "${time.toISOString()}"
          ORDER BY chat.createdAt DESC
          LIMIT ${limit};
      `;
            // const query = `
            // SELECT *
            // FROM \`${bucket}\` chat
            //   JOIN \`${bucket}\` owner
            //   ON KEYS chat.owner
            //   LEFT NEST \`${bucket}\` attachments
            //   ON KEYS chat.attachments

            //   WHERE chat._type = "${ChatMessageModelName}"
            //   AND chat.convoId = "${convoId}"
            //   AND chat.updatedAt ${sign} "${time}"
            //   LIMIT ${limit};
            // `;

            const [errorFetching, data = []] = await awaitTo(
                ChatMessageModel.customQuery<any>({
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
                const {chat, attachments, owner} = d;
                return ChatMessageModel.parse({
                    ...chat,
                    attachments,
                    owner: owner[0] || null,
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

            if (createdOrUpdate) {
                const topicId = ChatConvo.name;
                const message = createdOrUpdate.id;
                const convoId = createdOrUpdate.convoId;
                await publishMessageToTopic(ctx, topicId, {convoId, message});
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
