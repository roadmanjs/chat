import gql from 'graphql-tag';

export interface ChatResType {
    success: boolean;
    message?: string;
    data?: any;
}

export const ChatResTypeFragment = gql`
    fragment ChatResTypeFragment on ChatResType {
        success
        message
        data
    }
`;
