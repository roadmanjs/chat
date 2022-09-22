import {Resolver, Query, Mutation, Arg, UseMiddleware, Ctx, Subscription, Root} from 'couchset';
import {ContextType, ChatResType, getPagination} from '../../shared/ContextType';
import {isAuth} from '@roadmanjs/auth';
import {ChatMessage, ChatMessageType, OnChatMessage} from '../models/ChatMessage.model';
import {chatTyping, chatMessage, createChatMessage} from '../methods/ChatMessageResolver.methods';

const ChatPagination = getPagination(ChatMessage);

@Resolver()
export class ChatMessageResolver {
    // TODO subscriptions and auth middleware
    @Subscription(() => OnChatMessage, {
        topics: ChatMessage.name,
        filter: ({payload, args}) =>
            args.convoId === payload.convoId && args.owner !== payload.owner,
    })
    onChatMessage(
        @Root() data: OnChatMessage,
        @Arg('owner', () => String, {nullable: true}) owner: string,
        @Arg('convoId', () => String, {nullable: false}) convoId: string,
        @Arg('time', () => Date, {nullable: true}) time: Date
    ): OnChatMessage {
        return {convoId, time, owner, ...data};
    }

    @Query(() => Boolean)
    @UseMiddleware(isAuth)
    async chatTyping(
        @Ctx() ctx: ContextType,
        @Arg('convoId', () => String, {nullable: false}) convoId: string,
        @Arg('time', () => Date, {nullable: true}) time: Date // just to make the client HOT
    ): Promise<boolean> {
        return chatTyping(ctx, convoId, time);
    }

    @Query(() => ChatPagination)
    async chatMessage(
        @Ctx() ctx: ContextType,
        @Arg('convoId', () => String, {nullable: false}) convoId: string,
        //  @Arg('sort', () => String, {nullable: true}) sortArg?: string,
        @Arg('before', () => Date, {nullable: true}) before: Date,
        @Arg('after', () => Date, {nullable: true}) after: Date,
        @Arg('limit', () => Number, {nullable: true}) limit
    ): Promise<{
        items: ChatMessage[];
        hasNext: boolean;
        params: any;
    }> {
        return chatMessage({ctx, convoId, before, after, limit});
    }

    @Mutation(() => ChatResType)
    @UseMiddleware(isAuth)
    async createChatMessage(
        @Ctx() ctx: ContextType,
        @Arg('args', () => ChatMessageType, {nullable: false}) args: ChatMessageType
    ): Promise<ChatResType> {
        return createChatMessage(ctx, args);
    }
}

export default ChatMessageResolver;
