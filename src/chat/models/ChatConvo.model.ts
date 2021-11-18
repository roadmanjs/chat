import {Model} from 'couchset';
import {UserType} from '../../user';
import {ObjectType, Field, InputType} from 'type-graphql';
import {ChatMessageType} from './ChatMessage.model';

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
    avatar?: string;

    @Field(() => String, {nullable: true})
    owner: string;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    @Field({nullable: true})
    group?: boolean;

    @Field({nullable: true})
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

    @Field(() => String, {nullable: true})
    avatar?: string;

    @Field((type) => UserType, {nullable: true})
    owner: UserType;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    @Field({nullable: true})
    group?: boolean;

    @Field({nullable: true})
    unread?: number;

    @Field((type) => ChatMessageType, {nullable: true})
    lastMessage?: ChatMessageType;

    @Field((type) => [UserType], {nullable: true})
    members?: UserType[];
}

export const chatConvoSelectors = [
    'id',
    'name',
    'avatar',
    'convoId',
    'owner',
    'createdAt',
    'updatedAt',
    'group',
    'unread',
    'lastMessage',
    'members',
];

export const ChatConvoModel: Model = new Model(ChatConvoModelName);
export default ChatConvoModel;
