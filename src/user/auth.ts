import {Response} from 'express';
import {UserType} from '../user';
import {sign} from 'jsonwebtoken';

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('jid', token, {
        httpOnly: true,
        path: '/refresh_token',
    });
};

export const createAccessToken = (user: UserType) => {
    return sign({userId: user.id}, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '3d',
    });
};

export const createRefreshToken = (user: UserType) => {
    return sign(
        {userId: user.id, tokenVersion: user.tokenVersion},
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: '7d',
        }
    );
};
