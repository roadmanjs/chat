import {ChatMessageFragment} from '../fragments/chatMessage.fragment';
import gql from 'graphql-tag';

export const GET_CHAT_MESSAGE = gql`
    query GetChatMessage($convoId: String!, $before: DateTime, $after: DateTime, $limit: Float) {
        data: chatMessage(convoId: $convoId, before: $before, after: $after, limit: $limit) {
            items {
                ...ChatMessageFragment
            }
            hasNext
            params
        }
    }
    ${ChatMessageFragment}
`;
