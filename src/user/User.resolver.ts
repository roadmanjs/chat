import {Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, ContextType, ResType} from 'couchset';
import {UserType, UserModel, incrementRefreshToken} from './User.model';
import {sendRefreshToken} from './auth';
import {isAuth} from '../middlewares/isAuth';
import isEmpty from 'lodash/isEmpty';
import _get from 'lodash/get';
import {verify} from 'jsonwebtoken';

@Resolver()
export class UserResolver {
    @Query(() => UserType)
    @UseMiddleware(isAuth)
    async me(@Ctx() context: ContextType): Promise<UserType | null> {
        const authorization = _get(context, 'req.headers.authorization', '');
        if (isEmpty(authorization)) {
            throw new Error('Not Authenticated');
        }
        try {
            const token = authorization.split(' ')[1];
            const verified = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
            const {userId} = verified;
            if (isEmpty(userId)) {
                throw new Error('userId is not valid');
            }

            const user = await UserModel.findById(userId);
            return user;
        } catch (err) {
            console.log('error getting me', err);
            throw err;
        }
    }

    @Mutation(() => ResType)
    async revokeRefreshTokenForUser(@Arg('userId', () => String) userId: string): Promise<ResType> {
        try {
            const updated = await incrementRefreshToken(userId);
            if (!updated) {
                throw new Error('error revokeRefreshTokenForUser');
            }
            return {success: true};
        } catch (err) {
            return {success: false, message: err && err.message};
        }
    }

    @UseMiddleware(isAuth)
    @Mutation(() => ResType)
    async updateUserProfile(
        @Arg('user', () => UserType) user: UserType,
        @Ctx() {payload}: ContextType
    ): Promise<ResType> {
        try {
            const userId = payload && payload.userId;

            console.log('update userId', userId);
            const findUser = await UserModel.findById(userId);

            if (findUser) {
                const updatedUser = {
                    ...findUser,
                    ...user,
                };

                await UserModel.updateById(userId, updatedUser);

                return {success: true, data: updatedUser};
            }
            throw new Error('error updateing user');
        } catch (err) {
            return {success: false, message: err && err.message};
        }
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() {res}: ContextType) {
        sendRefreshToken(res, '');
        return true;
    }
}

export default UserResolver;
