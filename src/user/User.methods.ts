import UserModel, {LoginResponseType, UserType} from './User.model';
import _, {isEmpty} from 'lodash';
import {createAccessToken, createRefreshToken} from './auth';

import {log} from '@roadmanjs/logs';

/**
 * Shared Create user method
 * @param args
 */
export const createNewUser = async (args: UserType): Promise<LoginResponseType> => {
    const {email, fullname, phone, balance = 1} = args;
    try {
        const findIfExits = await UserModel.pagination({
            where: {
                $or: [{email: {$eq: email}}, {phone: phone}],
            },
        });

        if (!isEmpty(findIfExits)) {
            throw new Error('user already exists');
        }

        const names = (fullname || '').split(' ');
        const firstname = names.length ? names[0] : null;
        const lastname = names.length ? names[1] : null;

        const user: UserType = {
            fullname,
            firstname,
            lastname,
            phone,
            email,
            balance,
            currency: 'USD',
        };

        log('New user account', JSON.stringify(user));

        const userItem = _.pickBy(user, _.identity);
        // Create the user
        const createdUser: UserType = (await UserModel.create(userItem)) as UserType;

        const refreshToken = createRefreshToken(createdUser);
        const accessToken = createAccessToken(createdUser);

        return {
            success: true,
            user: createdUser,
            refreshToken,
            accessToken,
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
};

/**
 * Shared user login experience
 * @param user
 * @param password
 */
export const createLoginToken = async (user: UserType): Promise<LoginResponseType> => {
    try {
        if (!user) {
            throw new Error('could not find user');
        }

        const refreshToken = createRefreshToken(user);
        const accessToken = createAccessToken(user);

        return {
            success: true,
            accessToken,
            refreshToken,
            user,
        };
    } catch (error) {
        console.error('error login in', error);
        throw error;
    }
};
