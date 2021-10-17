import {Resolver, Arg, Query} from 'couchset';
import {log} from '@roadmanjs/logs';
import {UserModel, userModelPublicSelectors, UserType} from './User.model';

@Resolver()
export class UserResolverPublic {
    @Query(() => UserType)
    async getUser(
        @Arg('id', () => String, {nullable: false}) id: string
    ): Promise<UserType | null> {
        try {
            const username = id;

            log(`GET USER: id,username=${username}`);

            const users = await UserModel.pagination({
                select: userModelPublicSelectors,
                where: {
                    $or: [
                        {id: {$eq: username}},
                        {email: {$eq: username}},
                        {phone: {$eq: username}},
                        {phone: {$eq: `+1${username}`}},
                    ],
                },
            });
            log(`users found are users=${users && users.length}`);

            return users && users[0]; // get first document
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

export default UserResolverPublic;
