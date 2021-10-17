import {Field, InputType, Model, ObjectType, ResType} from 'couchset';

import {isEmpty} from 'lodash';

const modelName = 'User';
/**
 * GraphQL Types start
 */
@InputType('UserTypeInput')
@ObjectType()
export class UserType {
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

export const userModelPublicSelectors = [
    'id',
    'email',
    'username',
    'fullname',
    'firstname',
    'lastname',
    'phone',
    'website',
    'address',
    'country',
    'bio',
    'avatar',
];

@ObjectType()
export class LoginResponseType extends ResType {
    @Field(() => String, {nullable: true})
    refreshToken: string;

    @Field(() => String, {nullable: true})
    accessToken: string;

    @Field(() => UserType, {nullable: true})
    user: UserType;
}

export const UserModel: Model = new Model(modelName);

/**
 * Methods
 */
export const incrementRefreshToken = async (userId: string): Promise<boolean> => {
    const existing = await UserModel.findById(userId);
    if (!isEmpty(existing)) {
        const currentVersion = existing.tokenVersion || 0;
        existing.tokenVersion = currentVersion + 1;
        await UserModel.save(existing);
        return true;
    }
    return false;
};

export default UserModel;
