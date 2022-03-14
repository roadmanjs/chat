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
