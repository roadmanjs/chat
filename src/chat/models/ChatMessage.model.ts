import {Model} from 'couchset';
import {UserType} from '../../user';
import {ObjectType, Field, InputType} from 'type-graphql';
import {ChatAttachmentType} from './ChatAttachment.model';

export const ChatMessageModelName = 'ChatMessage';

/**
 * GraphQL Types start
 */
@InputType('ChatMessageInput')
@ObjectType()
export class ChatMessageType {
    // Auto
    @Field(() => String, {nullable: true})
    id: string;

    @Field(() => String, {nullable: true})
    owner: string;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;
    // Auto end

    @Field({nullable: true})
    system?: boolean;

    @Field({nullable: true})
    convoId?: string;

    @Field(() => String, {nullable: true})
    attachments?: string[];

    @Field({nullable: true})
    message?: string;
}

@ObjectType()
export class ChatMessage {
    // Auto
    @Field(() => String, {nullable: true})
    id: string;

    @Field((type) => UserType, {nullable: true})
    owner: UserType;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    @Field({nullable: true})
    system?: boolean;

    @Field({nullable: true})
    convoId?: string;

    @Field((type) => [ChatAttachmentType], {nullable: true})
    attachments?: ChatAttachmentType[];

    @Field({nullable: true})
    message?: string;
}

export const chatMessageSelectors = [
    'id',
    'owner',
    'owner',
    'createdAt',
    'updatedAt',
    'convoId',
    'attachments',
    'message',
];

export const ChatMessageModel: Model = new Model(ChatMessageModelName);
export default ChatMessageModel;
