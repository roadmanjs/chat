import gql from 'graphql-tag';

export const ResTypeFragment = gql`
    fragment ResTypeFragment on ResType {
        success
        message
        data
    }
`;
