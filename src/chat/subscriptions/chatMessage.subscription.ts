import gql from 'graphql-tag';

export const ON_CHAT_MESSAGE_SUBSCRIPTION = gql`
    subscription OnChatMessage($owner: String, $convoId: String!, $time: DateTime) {
        data: onChatMessage(owner: $owner, convoId: $convoId, time: $time) {
            convoId
            typing
            message
            time
            owner
        }
    }
`;
