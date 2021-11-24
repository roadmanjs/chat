import {Field, InputType, Model, ObjectType} from 'couchset';

import {ChatAttachmentType} from './ChatAttachment.model';
import {UserType} from '../../user';

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

    @Field(() => UserType, {nullable: true})
    owner: UserType;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    @Field(() => Boolean, {nullable: true})
    system?: boolean;

    @Field(() => String, {nullable: true})
    convoId?: string;

    @Field(() => [ChatAttachmentType], {nullable: true})
    attachments?: ChatAttachmentType[];

    @Field(() => String, {nullable: true})
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
