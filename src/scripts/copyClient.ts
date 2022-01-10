import {createClientPackageJson} from './createPackageJsonForClient';
import shelljs from 'shelljs';
import {writeFileSync} from 'fs';
/**
 * TODO script to copy fragments, query, mutations, subscriptions into client output
 * - The copy some parts of package-json, like version number
 * - Publish the separate client package.
 */

/**
 Using shell we create an output folder with these files
 dist-client
   - README.md
   - package.json (edited with minimal deps)
   - docs
   - register
   - dist              ✅
        - fragments
        - query
        - mutations
        - subscriptions
     - index.ts

@PS - NOTES to friends reading this.
 - Why not use yarn workspaces? these are smaller packages, some might have very few files, plus lerna private e.t.c...
 - A script is more efficient and faster, can run together with main publishing CI/CD
 - Two bird with one stone.

 */

(async () => {
    // Dirs
    shelljs.rm('-rf', 'dist-client');
    shelljs.mkdir('-p', 'dist-client');
    shelljs.mkdir('-p', 'dist-client/dist');

    // register & docs
    shelljs.cp('-rf', 'register', 'dist-client/register');
    shelljs.cp('-rf', 'docs', 'dist-client/docs');

    // README.md
    shelljs.cp('-rf', 'README.md', 'dist-client/README.md');

    // package.json
    // TODO edit package.json to make it smaller with less deps
    // shelljs.cp('-rf', 'package.json', 'dist-client/package.json');

    // frags, query, mutations, sub
    shelljs.cp('-rf', 'dist/chat/fragments', 'dist-client/dist/fragments');
    shelljs.cp('-rf', 'dist/chat/query', 'dist-client/dist/query');
    shelljs.cp('-rf', 'dist/chat/mutations', 'dist-client/dist/mutations');
    shelljs.cp('-rf', 'dist/chat/subscriptions', 'dist-client/dist/subscriptions');

    // index
    shelljs.cp('-rf', 'dist/chat/index-client.d.ts', 'dist-client/dist/index.d.ts');
    shelljs.cp('-rf', 'dist/chat/index-client.js', 'dist-client/dist/index.js');
    shelljs.cp('-rf', 'dist/chat/index-client.js.map', 'dist-client/dist/index.js.map');

    const getPackageJsonFile = await createClientPackageJson();
    console.log('string file', JSON.stringify(getPackageJsonFile));
    writeFileSync('dist-client/package.json', JSON.stringify(getPackageJsonFile), {
        encoding: 'utf8',
    });
})();
