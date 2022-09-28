import 'reflect-metadata';
import 'mocha';

import {expect} from 'chai';
import { getChatConvoById } from './ChatConvo.methods';
import {sendMessageToUser} from '@roadmanjs/push';
import {sendPushNotification} from '../../shared/pubsub.utils';
import {startCouchbase} from '@roadmanjs/couchset';

before((done) => {
    startCouchbase().then(() => done());
});

describe('ChatConvo', () => {
    // it('it should send a push notification to a user', async () => {
    //     const senderId = '1c01d85f-b811-44b1-8a4f-bef8030bf265';
    //     const convoId = 'b613b7c5-5f73-4331-8703-3a1176728a31';

    //     const owner = '99bc43ba-02ab-4394-b48b-49a39a95443c';

    //     const sendMessage = await sendPushNotification(senderId, {
    //         owner,
    //         convoId,
    //         message: 'some message',
    //     });
    //     expect(sendMessage).to.not.be.empty;
    // });
    // it('it should create an new convo and return it', async () => {
    //     const newConvo: ChatConvoType = {
    //         owner: '1c01d85f-b811-44b1-8a4f-bef8030bf265',
    //         members: [
    //             '1c01d85f-b811-44b1-8a4f-bef8030bf265',
    //             '0ac710ce-4530-4ea9-8f70-9d19383c95d4',
    //         ],
    //         group: true,
    //     };

    //     const newConvoCreated = await startConvo(newConvo);

    //     console.log('new convo create', newConvoCreated);
    //     console.log('new convo create members', newConvoCreated.data.members);

    //     expect(newConvoCreated).to.be.not.empty;
    // });

    it("it should return chat convo with joins", async () => {
        const convo = await getChatConvoById("d2bb6ba6-1bc5-480a-a3ae-c28bec3708bf", "1c01d85f-b811-44b1-8a4f-bef8030bf265");

        console.log('convo with joins', convo);
        expect(convo.members[0].id).to.be.not.empty;
    })

    // it("Create convo", async () => {
    //   const owner = "1c01d85f-b811-44b1-8a4f-bef8030bf265";
    //   const otherUser = "99bc43ba-02ab-4394-b48b-49a39a95443c";
    //   const members = [owner, otherUser];

    //   const chatConvo = {
    //       members,
    //       group: false,

    //   };

    //   const createdConvo = await createChatConvoType(chatConvo);

    //   console.log("Created", createdConvo);
    //   expect(createdConvo).to.not.be.empty;
    // });

    // it("Remove read count", async () => {
    //   const owner = "1c01d85f-b811-44b1-8a4f-bef8030bf265";
    //   const convoId = "b613b7c5-5f73-4331-8703-3a1176728a31";

    //   const hasUpdateCount = await removeUnreadCount(owner, convoId);

    //   console.log("Created", hasUpdateCount);
    //   expect(hasUpdateCount).to.be.true;
    // });

    // it('Start public ChatConvo', async () => {
    //     const id = 'rtv-1';

    //     const publicConvo = await startPublicConvo(id);

    //     console.log('Created', publicConvo);

    //     expect(publicConvo.public).to.be.true;
    // });

    // it('GetConvoOwnerNAuth public convo', async () => {
    //     const convoId = 'e8e15949-311e-4954-8701-3fe46cc21b98';
    //     const mockContext = {
    //         req: {
    //             headers: {
    //                 authorization: '',
    //             },
    //         },
    //     };

    //     const publicMessages = await getConvoOwnerNAuth(convoId, mockContext);

    //     console.log('publicMessages', publicMessages);

    //     expect(publicMessages).not.to.be.empty;
    // });

    // it('GetConvoOwnerNAuth private convo', async () => {
    //     const convoId = 'e9992706-e854-4aef-bb5f-5e09d4224bf4';
    //     const mockContext = {
    //         req: {
    //             headers: {
    //                 authorization:
    //                     'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5OWJjNDNiYS0wMmFiLTQzOTQtYjQ4Yi00OWEzOWE5NTQ0M2MiLCJpYXQiOjE2NjMyMTc2MjMsImV4cCI6MTY2MzQ3NjgyM30.zvCJo95goSCemwhvSEXF5nd3jIDhMZTfVrn9jUeo1OA',
    //             },
    //         },
    //     };

    //     const publicMessages = await getConvoOwnerNAuth(convoId, mockContext);

    //     console.log('publicMessages', publicMessages);

    //     expect(publicMessages).not.to.be.empty;
    // });
});
