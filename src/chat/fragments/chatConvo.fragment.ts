import {ChatMessageTypeFragment} from './chatMessage.fragment';
import {ChatUserTypeFragment} from './chatUser.fragment';
import gql from 'graphql-tag';

export const ChatConvoFragment = gql`
    fragment ChatConvoFragment on ChatConvo {
        id
        convoId
        name
        source
        sourceId
        sourceType
        avatar
        owner {
            ...ChatUserTypeFragment
        }
        createdAt
        updatedAt
        group
        public
        unread
        lastMessage {
            ...ChatMessageTypeFragment
        }
        members {
            ...ChatUserTypeFragment
        }
    }

    ${ChatMessageTypeFragment}
    ${ChatUserTypeFragment}
`;
