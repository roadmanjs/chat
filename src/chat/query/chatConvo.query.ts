import {ChatConvoFragment} from '../fragments/chatConvo.fragment';
import gql from 'graphql-tag';

export const GET_CHAT_CONVO = gql`
    query GetChatConvo($owner: String!, $before: DateTime, $after: DateTime, $limit: Float) {
        data: chatConvo(owner: $owner, before: $before, after: $after, limit: $limit) {
            items {
                ...ChatConvoFragment
            }
            hasNext
            params
        }
    }
    ${ChatConvoFragment}
`;

export const GET_CHAT_CONVO_BY_ID = gql`
    query GetChatConvoById($id: String!) {
        data: chatConvoById(id: $id) {
            ...ChatConvoFragment
        }
    }
    ${ChatConvoFragment}
`;
