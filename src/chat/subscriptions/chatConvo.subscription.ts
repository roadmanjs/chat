import gql from 'graphql-tag';

export const ON_CHAT_CONVO_SUBSCRIPTION = gql`
    subscription onChatConvo($convoId: String!) {
        data: onChatConvo(convoId: $convoId)
    }
`;

export const ON_CONVOS_SUBSCRIPTION = gql`
    subscription OnConvos($owner: String!, $time: DateTime) {
        data: onConvos(owner: $owner, time: $time) {
            convoId
            typing
            message
            time
            owner
        }
    }
`;
