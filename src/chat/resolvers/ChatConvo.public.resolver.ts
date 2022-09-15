import {Resolver, Arg, Query} from 'type-graphql';
import {ChatConvo} from '../models/ChatConvo.model';
import {startPublicConvo} from '../methods/ChatConvoResolver.methods';

@Resolver()
export class ChatConvoPublicResolver {
    @Query(() => ChatConvo)
    async chatConvoPublicById(
        @Arg('id', () => String, {nullable: false}) id: string
    ): Promise<ChatConvo> {
        return startPublicConvo(id);
    }
}

export default ChatConvoPublicResolver;
