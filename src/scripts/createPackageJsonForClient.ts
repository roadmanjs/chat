/**
 * A simple script to copy current version from main package.json and create a client version
 */

import {readFileSync} from 'fs';

/**
 * Re-usable method for generating client package.json
 * @param clientPackageName
 */
export const createClientPackageJson = async (): Promise<Object> => {
    const packageFile: any = await readFileSync('package.json', {encoding: 'utf8'});
    const packageContentJSON = JSON.parse(packageFile);

    const newPackage: Object = {
        ...packageContentJSON,
        name: '@roadmanjs/chat-client', // TODO edit it from props
        description: '@roadmanjs/chat fragments, query, mutations, subscriptions', // TODO from args
        dependencies: {
            // make it only one dep for easy client react .e.t.c
            'graphql-tag': '^2.12.5',
        },
        devDependencies: {}, // make it empty
        peerDependencies: {}, // make it empty
        scripts: {}, // empty scripts
    };

    // console.log('new packageJson file', newPackage);

    return newPackage;
};
createClientPackageJson();
