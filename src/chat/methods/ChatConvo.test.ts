import "reflect-metadata";
import "mocha";

import { createChatConvoType, removeUnreadCount } from "./ChatConvo.methods";

import { expect } from "chai";
import { startCouchbase } from "@roadmanjs/couchset";

before((done) => {
  startCouchbase().then(() => done());
});

describe("ChatConvo", () => {
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

  it("Remove read count", async () => {
    const owner = "1c01d85f-b811-44b1-8a4f-bef8030bf265";
    const convoId = "e9992706-e854-4aef-bb5f-5e09d4224bf4";

    const hasUpdateCount = await removeUnreadCount(owner, convoId);
    
    console.log("Created", hasUpdateCount);
    expect(hasUpdateCount).to.be.true;
  });
});
