import gql from 'graphql-tag';

export const ON_CHAT_CONVO_SUBSCRIPTION = gql`
    subscription onChatConvo($convoId: String!) {
        data: onChatConvo(convoId: $convoId)
    }
`;
