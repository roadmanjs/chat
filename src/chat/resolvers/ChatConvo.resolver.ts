import {Resolver, Mutation, Ctx, Arg, Query, Subscription, Root, UseMiddleware} from 'type-graphql';
import {ChatConvo, ChatConvoType} from '../models/ChatConvo.model';
import {
    chatConvo,
    chatConvoById,
    createChatConvo,
    startConvo,
} from '../methods/ChatConvoResolver.methods';
import {isAuth} from '@roadmanjs/auth';
import {ChatResType, getPagination, ContextType} from '../../shared/ContextType';
import {OnChatMessage} from '../models';
import _get from 'lodash/get';

const ConvoPagination = getPagination(ChatConvo);

@Resolver()
export class ChatConvoResolver {
    // TODO auth middleware
    @Subscription(() => OnChatMessage, {
        topics: ChatConvo.name,
        filter: ({payload, args}) => args.owner === payload.owner,
    })
    onConvos(
        @Root() data: OnChatMessage,
        @Arg('owner', () => String, {nullable: false}) owner: string,
        @Arg('time', () => Date, {nullable: true}) time: Date // just to make the client HOT
    ): OnChatMessage {
        return {time, owner, ...data};
    }

    @Query(() => ChatConvo)
    @UseMiddleware(isAuth)
    async chatConvoById(
        @Ctx() ctx: ContextType,
        @Arg('id', () => String, {nullable: false}) id: string
    ): Promise<ChatConvo> {
        const owner = _get(ctx, 'payload.userId', ''); // loggedIn user

        return chatConvoById(id, owner);
    }

    @Query(() => ConvoPagination)
    @UseMiddleware(isAuth)
    async chatConvo(
        @Arg('owner', () => String, {nullable: false}) owner: string,
        // @Arg('sort', () => String, {nullable: true}) sortArg?: string,
        @Arg('before', () => Date, {nullable: true}) before: Date,
        @Arg('after', () => Date, {nullable: true}) after: Date,
        @Arg('limit', () => Number, {nullable: true}) limit
    ): Promise<{items: ChatConvo[]; hasNext: boolean; params: any}> {
        return chatConvo({owner, before, after, limit});
    }

    @Mutation(() => ChatResType)
    @UseMiddleware(isAuth)
    async createChatConvo(
        @Arg('args', () => ChatConvoType, {nullable: true}) args: ChatConvoType
    ): Promise<ChatResType> {
        return createChatConvo(args);
    }

    @Mutation(() => ChatResType)
    @UseMiddleware(isAuth)
    async startConvo(
        @Arg('args', () => ChatConvoType, {nullable: true}) args: ChatConvoType
    ): Promise<ChatResType> {
        return startConvo(args);
    }
}

export default ChatConvoResolver;
