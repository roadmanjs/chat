import {Field, InputType, Model, ObjectType} from 'couchset';

export const ChatAttachmentModelName = 'ChatAttachment';

/**
 * GraphQL Types start
 */
@InputType('ChatAttachmentInput')
@ObjectType()
export class ChatAttachmentType {
    // Auto
    @Field(() => String, {nullable: true})
    id: string;

    @Field(() => String, {nullable: true})
    messageId?: string;

    @Field(() => String, {nullable: true})
    owner: string;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;

    // Auto end

    @Field(() => String, {nullable: true})
    filename?: string;

    @Field(() => String, {nullable: true})
    mimetype?: string;

    @Field(() => String, {nullable: true})
    encoding?: string;

    @Field(() => String, {nullable: true})
    url?: string;
}

export const ChatAttachmentModel: Model = new Model(ChatAttachmentModelName);
export default ChatAttachmentModel;
