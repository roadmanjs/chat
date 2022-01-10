import {ResTypeFragment} from '../fragments/resType';
import gql from 'graphql-tag';

export const CREATE_CHAT_MESSAGE_MUTATION = gql`
    mutation CreateChatMessage($args: ChatMessageInput!) {
        data: createChatMessage(args: $args) {
            ...ResTypeFragment
        }
    }
    ${ResTypeFragment}
`;
