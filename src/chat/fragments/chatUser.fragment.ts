import gql from 'graphql-tag';

export const ChatUserTypeFragment = gql`
    fragment ChatUserTypeFragment on ChatUserType {
        id
        username
        fullname
        firstname
        lastname
        email
        phone
        website
        country
        bio
        address
        tokenVersion
        avatar
        balance
        currency
    }
`;

export default ChatUserTypeFragment;
