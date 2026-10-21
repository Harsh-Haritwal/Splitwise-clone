process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";

const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Group = require("../src/models/groupModel");

let mongoServer;

const signup = async (name, email) => {
  const response = await request(app)
    .post("/user/signup")
    .send({ name, email, password: "password123" });

  assert.equal(response.status, 201);
  assert.ok(response.body.token);

  const profile = await request(app)
    .get("/user/profile")
    .set("Authorization", `Bearer ${response.body.token}`);

  return {
    token: response.body.token,
    userId: profile.body.user._id,
  };
};

const createGroup = async (token, memberIds, name = "Test group") => {
  const response = await request(app)
    .post("/group/create")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, members: memberIds });

  assert.equal(response.status, 201);
  return response.body.group;
};

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const collectionName of Object.keys(collections)) {
    await collections[collectionName].deleteMany({});
  }
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test("health check returns a successful response", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});

test("signup validates input and rejects duplicate emails", async () => {
  const weakPassword = await request(app).post("/user/signup").send({
    name: "Test User",
    email: "test@example.com",
    password: "short",
  });
  assert.equal(weakPassword.status, 400);

  await signup("Test User", "test@example.com");

  const duplicate = await request(app).post("/user/signup").send({
    name: "Another User",
    email: "TEST@example.com",
    password: "password123",
  });
  assert.equal(duplicate.status, 409);
});

test("login accepts valid details and rejects a wrong password", async () => {
  await signup("Login User", "login@example.com");

  const validLogin = await request(app).post("/user/login").send({
    email: "login@example.com",
    password: "password123",
  });
  assert.equal(validLogin.status, 200);
  assert.ok(validLogin.body.token);

  const wrongPassword = await request(app).post("/user/login").send({
    email: "login@example.com",
    password: "wrong-password",
  });
  assert.equal(wrongPassword.status, 401);
});

test("protected routes require a token", async () => {
  const response = await request(app).get("/group/my-groups");

  assert.equal(response.status, 401);
  assert.ok(response.body.msg);
});

test("a group expense is saved, paginated and included in balances", async () => {
  const owner = await signup("Owner User", "owner@example.com");
  const friend = await signup("Friend User", "friend@example.com");
  const group = await createGroup(owner.token, [
    owner.userId,
    friend.userId,
  ]);

  for (let index = 1; index <= 3; index++) {
    const expense = await request(app)
      .post("/expense/add")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        description: `Expense ${index}`,
        amount: 100,
        groupId: group._id,
        paidBy: owner.userId,
        participants: [owner.userId, friend.userId],
        splitType: "equal",
      });

    assert.equal(expense.status, 201);
    assert.equal(expense.body.expense.amount, 100);
  }

  const firstPage = await request(app)
    .get(`/expense/group/${group._id}?page=1&limit=2`)
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(firstPage.status, 200);
  assert.equal(firstPage.body.expenses.length, 2);
  assert.equal(firstPage.body.total, 3);
  assert.equal(firstPage.body.totalPages, 2);

  const secondPage = await request(app)
    .get(`/expense/group/${group._id}?page=2&limit=2`)
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(secondPage.body.expenses.length, 1);

  const balances = await request(app)
    .get(`/balance/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(balances.status, 200);
  const ownerBalance = balances.body.balances.find(
    (balance) => balance.user._id === owner.userId,
  );
  assert.ok(ownerBalance);
  assert.equal(ownerBalance.balance, 150);
});

test("a settlement can be recorded and listed", async () => {
  const owner = await signup("Owner Two", "owner2@example.com");
  const friend = await signup("Friend Two", "friend2@example.com");
  const group = await createGroup(owner.token, [
    owner.userId,
    friend.userId,
  ]);

  const settlement = await request(app)
    .post("/settlement/add")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      groupId: group._id,
      paidBy: friend.userId,
      paidTo: owner.userId,
      amount: 25,
      note: "Paid by bank transfer",
    });

  assert.equal(settlement.status, 201);
  assert.equal(settlement.body.settlement.amount, 25);

  const list = await request(app)
    .get(`/settlement/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(list.status, 200);
  assert.equal(list.body.settlements.length, 1);
  assert.equal(list.body.settlements[0].note, "Paid by bank transfer");
});

test("only the group creator can rename or delete a group", async () => {
  const owner = await signup("Group Owner", "owner3@example.com");
  const friend = await signup("Group Friend", "friend3@example.com");
  const group = await createGroup(owner.token, [
    owner.userId,
    friend.userId,
  ]);

  const renameByFriend = await request(app)
    .patch(`/group/${group._id}`)
    .set("Authorization", `Bearer ${friend.token}`)
    .send({ name: "Friend rename" });
  assert.equal(renameByFriend.status, 403);

  const deleteByFriend = await request(app)
    .delete(`/group/${group._id}`)
    .set("Authorization", `Bearer ${friend.token}`);
  assert.equal(deleteByFriend.status, 403);

  const renameByOwner = await request(app)
    .patch(`/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Owner rename" });
  assert.equal(renameByOwner.status, 200);
  assert.equal(renameByOwner.body.group.name, "Owner rename");

  const removeByFriend = await request(app)
    .delete(`/group/${group._id}/members/${owner.userId}`)
    .set("Authorization", `Bearer ${friend.token}`);
  assert.equal(removeByFriend.status, 403);

  const removeByOwner = await request(app)
    .delete(`/group/${group._id}/members/${friend.userId}`)
    .set("Authorization", `Bearer ${owner.token}`);
  assert.equal(removeByOwner.status, 200);
  assert.equal(removeByOwner.body.group.members.length, 1);

  const deleteByOwner = await request(app)
    .delete(`/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`);
  assert.equal(deleteByOwner.status, 200);

  const getDeletedGroup = await request(app)
    .get(`/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`);
  assert.equal(getDeletedGroup.status, 404);
});

test("a member with an open balance cannot be removed", async () => {
  const owner = await signup("Balance Owner", "balance-owner@example.com");
  const friend = await signup("Balance Friend", "balance-friend@example.com");
  const group = await createGroup(owner.token, [
    owner.userId,
    friend.userId,
  ]);

  const expense = await request(app)
    .post("/expense/add")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({
      description: "Dinner",
      amount: 100,
      groupId: group._id,
      paidBy: owner.userId,
      participants: [owner.userId, friend.userId],
      splitType: "equal",
    });

  assert.equal(expense.status, 201);

  const blockedRemoval = await request(app)
    .delete(`/group/${group._id}/members/${friend.userId}`)
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(blockedRemoval.status, 400);
  assert.match(blockedRemoval.body.msg, /Settle up with this member/);

  const groupAfterBlockedRemoval = await request(app)
    .get(`/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`);

  assert.equal(groupAfterBlockedRemoval.body.group.members.length, 2);

  // Simulate an older group where a member was removed before this guard existed.
  await Group.findByIdAndUpdate(group._id, {
    $pull: { members: friend.userId },
  });

  const balances = await request(app)
    .get(`/balance/group/${group._id}`)
    .set("Authorization", `Bearer ${owner.token}`);
  assert.equal(balances.status, 200);

  const summary = await request(app)
    .get(`/balance/group/${group._id}/summary`)
    .set("Authorization", `Bearer ${owner.token}`);
  assert.equal(summary.status, 200);

  const simplified = await request(app)
    .get(`/balance/group/${group._id}/settle`)
    .set("Authorization", `Bearer ${owner.token}`);
  assert.equal(simplified.status, 200);

  for (const settlement of simplified.body.settlements) {
    assert.ok(settlement.from);
    assert.ok(settlement.to);
  }
});

test("unknown routes return a JSON 404 response", async () => {
  const response = await request(app).get("/api/does-not-exist");

  assert.equal(response.status, 404);
  assert.match(response.body.msg, /Route not found/);
});
