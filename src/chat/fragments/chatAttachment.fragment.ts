import gql from 'graphql-tag';

export const ChatAttachmentTypeFragment = gql`
    fragment ChatAttachmentTypeFragment on ChatAttachmentType {
        id
        messageId
        owner
        createdAt
        updatedAt
        filename
        mimetype
        encoding
        url
    }
`;
