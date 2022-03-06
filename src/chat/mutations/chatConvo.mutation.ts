import {ChatResTypeFragment} from '../fragments/resType';
import gql from 'graphql-tag';

export const CREATE_CHAT_CONVO_MUTATION = gql`
    mutation CreateChatConvo($args: ChatConvoInput!) {
        data: createChatConvo(args: $args) {
            ...ChatResTypeFragment
        }
    }
    ${ChatResTypeFragment}
`;

export const START_CHAT_CONVO_MUTATIONS = gql`
    mutation StartChatConvo($args: ChatConvoInput!) {
        data: startConvo(args: $args) {
            ...ChatResTypeFragment
        }
    }
    ${ChatResTypeFragment}
`;
