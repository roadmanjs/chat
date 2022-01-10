import gql from 'graphql-tag';
import {ResTypeFragment} from '../shared';

export const CREATE_CHAT_MESSAGE_MUTATION = gql`
    mutation CreateChatMessage($args: ChatMessageInput!) {
        data: createChatMessage(args: $args) {
            ...ResTypeFragment
        }
    }
    ${ResTypeFragment}
`;
