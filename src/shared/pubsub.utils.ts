import {UserModel, UserType} from '@roadmanjs/auth';

import {ContextType} from './ContextType';
import {log} from '@roadmanjs/logs';

// import {sendMessageToUser} from '@roadmanjs/push';

/**
 * Publish any message to a topic
 * @param ctx
 * @param topic
 * @param data
 * @returns
 */
export const publishMessageToTopic = async (
    ctx: ContextType,
    topic: string | string[],
    data: any
): Promise<boolean> => {
    if (ctx && ctx.pubsub) {
        if (Array.isArray(topic)) {
            await Promise.all(
                topic.map((tpc) => {
                    return ctx.pubsub.publish(tpc, data);
                })
            );
        } else {
            await ctx.pubsub.publish(topic, data);
        }

        return true;
    }
    return false;
};

interface SendPushNotificationData extends Record<string, any> {
    message: string;
    owner: string;
    convoId: string;
}

export const sendPushNotification = async (
    senderId: string,
    data: SendPushNotificationData
): Promise<any> => {
    try {
        const {owner, message} = data;

        const sender: UserType = await UserModel.findById(senderId);

        if (sender) {
            const imageUrl = sender.avatar; // todo default

            const fullnames = sender.fullname || sender.firstname + ' ' + sender.lastname;

            const sentMessage = {
                owner,
                data: {
                    type: 'chat',
                    ...data,
                },
                notification: {
                    title: `Message from ${fullnames}`,
                    body: message.substring(0, 50),
                    imageUrl: imageUrl,
                },
            };
            // TODO send push notification, use events to avoid direct import / dependency
            // import {sendMessageToUser} from '@roadmanjs/push';
            /**
             * 
                const sentMessage = await sendMessageToUser(owner, {
                    data: {
                        type: 'chat',
                        ...data,
                    },
                    notification: {
                        title: `Message from ${fullnames}`,
                        body: message.substring(0, 50),
                        imageUrl: imageUrl,
                    },
                });

                return sentMessage;
             
             */

            return sentMessage;
        }
    } catch (error) {
        log('error sending push notification', error);
    }
};
