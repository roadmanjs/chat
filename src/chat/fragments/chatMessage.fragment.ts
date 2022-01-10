import {ChatAttachmentTypeFragment} from './chatAttachment.fragment';
import {ChatUserTypeFragment} from './chatUser.fragment';
import gql from 'graphql-tag';

export const ChatMessageTypeFragment = gql`
    fragment ChatMessageTypeFragment on ChatMessageType {
        id
        owner
        createdAt
        updatedAt
        system
        convoId
        attachments
        message
    }
`;

export const ChatMessageFragment = gql`
    fragment ChatMessageFragment on ChatMessage {
        id
        owner {
            ...ChatUserTypeFragment
        }
        createdAt
        updatedAt
        system
        convoId
        attachments {
            ...ChatAttachmentTypeFragment
        }
        message
    }
    ${ChatUserTypeFragment}
    ${ChatAttachmentTypeFragment}
`;
