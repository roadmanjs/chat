import {Field, ObjectType} from 'couchset';

/**
 * GraphQL Types start
 */

@ObjectType('ChatUserType')
export class ChatUserType {
    @Field(() => String, {nullable: true})
    id?: string;

    @Field(() => String, {nullable: true})
    email?: string;

    @Field(() => String, {nullable: true})
    username?: string;

    @Field(() => String, {nullable: true})
    fullname?: string;

    @Field(() => String, {nullable: true})
    firstname?: string;

    @Field(() => String, {nullable: true})
    lastname?: string;

    @Field(() => String, {nullable: true})
    phone?: string;

    @Field(() => String, {nullable: true})
    website?: string;

    @Field(() => String, {nullable: true})
    address?: string;

    @Field(() => String, {nullable: true})
    country?: string;

    @Field(() => String, {nullable: true})
    bio?: string;

    @Field(() => String, {nullable: true})
    avatar?: string;

    // Wallet here
    @Field(() => String, {nullable: true})
    currency?: string;

    @Field(() => Number, {nullable: true})
    balance?: number;

    @Field(() => Boolean, {nullable: true})
    admin?: boolean;

    @Field(() => [String], {nullable: true})
    plans?: string[];

    // Revoke accessToken
    @Field(() => Number, {nullable: true})
    tokenVersion?: number;

    @Field(() => Date, {nullable: true})
    createdAt?: Date;

    @Field(() => Date, {nullable: true})
    updatedAt?: Date;
}
