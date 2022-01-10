import {ChatMessageTypeFragment} from './chatMessage.fragment';
import {ChatUserTypeFragment} from './chatUser.fragment';
import gql from 'graphql-tag';

export const ChatConvoFragment = gql`
    fragment ChatConvoFragment on ChatConvo {
        id
        convoId
        name
        avatar
        owner {
            ...ChatUserTypeFragment
        }
        createdAt
        updatedAt
        group
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
