import {Field, InputType, Model, ObjectType} from 'couchset';

import {ChatMessageType} from './ChatMessage.model';
import {ChatUserType} from './ChatUser.model';
import GraphQLJSON from 'graphql-type-json';

export const ChatConvoModelName = 'ChatConvo';

/**
 * GraphQL Types start
 */
@InputType('ChatConvoInput')
@ObjectType()
export class ChatConvoType {
    // Auto
    @Field(() => String, {nullable: true})
    id?: string;

    @Field(() => String, {nullable: true})
    convoId?: string;

    @Field(() => String, {nullable: true})
    name?: string;

    @Field(() => String, {nullable: true})
    sourceType?: string;

    @Field(() => String, {nullable: true})
    sourceId?: string;

    @Field(() => String, {nullable: true})
    avatar?: string;

    @Field(() => String, {nullable: true})
    owner: string;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    @Field(() => Boolean, {nullable: true})
    public?: boolean;

    @Field(() => Boolean, {nullable: true})
    group?: boolean;

    @Field(() => Number, {nullable: true})
    unread?: number;

    @Field(() => String, {nullable: true})
    lastMessage?: string;

    @Field(() => [String], {nullable: true})
    members?: string[];
}

@ObjectType()
export class ChatConvo {
    // Auto
    @Field(() => String, {nullable: true})
    id?: string;

    @Field(() => String, {nullable: true})
    convoId?: string;

    @Field(() => String, {nullable: true})
    name?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Field((type) => GraphQLJSON, {nullable: true})
    source?: any;

    @Field(() => String, {nullable: true})
    sourceType?: string;

    @Field(() => String, {nullable: true})
    sourceId?: string;

    @Field(() => String, {nullable: true})
    avatar?: string;

    @Field(() => ChatUserType, {nullable: true})
    owner: ChatUserType;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    @Field(() => Boolean, {nullable: true})
    public?: boolean;

    @Field(() => Boolean, {nullable: true})
    group?: boolean;

    @Field(() => Number, {nullable: true})
    unread?: number;

    @Field(() => ChatMessageType, {nullable: true})
    lastMessage?: ChatMessageType;

    @Field(() => [ChatUserType], {nullable: true})
    members?: ChatUserType[];
}

export const chatConvoSelectors = [
    'id',
    'name',
    'sourceType',
    'sourceId',
    'avatar',
    'convoId',
    'owner',
    'createdAt',
    'updatedAt',
    'public',
    'group',
    'unread',
    'lastMessage',
    'members',
];

export const ChatConvoModel: Model = new Model(ChatConvoModelName);
export default ChatConvoModel;
