import gql from 'graphql-tag';

export const ON_CHAT_MESSAGE_SUBSCRIPTION = gql`
    subscription OnChatMessage($convoId: String!, $time: DateTime) {
        data: onChatMessage(convoId: $convoId, time: $time) {
            convoId
            typing
            message
            time
            owner
        }
    }
`;
