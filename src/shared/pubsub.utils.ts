import {ContextType} from './ContextType';

/**
 * Publish any message to a topic
 * @param ctx
 * @param topic
 * @param data
 * @returns
 */
export const publishMessageToTopic = async (
    ctx: ContextType,
    topic: string,
    data: any
): Promise<boolean> => {
    if (ctx && ctx.pubsub) {
        await ctx.pubsub.publish(topic, data);
        return true;
    }
    return false;
};
