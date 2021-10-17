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

    @Field({nullable: true})
    username?: string;

    @Field({nullable: true})
    fullname?: string;

    @Field({nullable: true})
    firstname?: string;

    @Field({nullable: true})
    lastname?: string;

    @Field({nullable: true})
    phone?: string;

    @Field({nullable: true})
    website?: string;

    @Field({nullable: true})
    address?: string;

    @Field({nullable: true})
    country?: string;

    @Field({nullable: true})
    bio?: string;

    @Field({nullable: true})
    avatar?: string;

    // Wallet here
    @Field({nullable: true})
    currency?: string;

    @Field({nullable: true})
    balance?: number;

    @Field({nullable: true})
    admin?: boolean;

    @Field(() => [String], {nullable: true})
    plans?: string[];

    // Revoke accessToken
    @Field({nullable: true})
    tokenVersion?: number;

    @Field(() => String, {nullable: true})
    createdAt?: Date;

    @Field(() => String, {nullable: true})
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
    @Field({nullable: true})
    refreshToken: string;

    @Field({nullable: true})
    accessToken: string;

    @Field({nullable: true})
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
