import assert from "node:assert/strict";
import {
  connectAssistantByDoctorCode,
  createAssistantInvite,
  derive12DigitAssistantCode,
  deriveDoctorConnectCode,
  getAssistantPairingState,
  getDoctorAssistantsState,
  isValid12DigitCode,
  respondToAssistantInvite,
  revokeAssistantConnection,
} from "../doctor-assistant-link";

async function runDoctorAssistantPairingTests() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`✅ PASS: ${name}`);
    } catch (err: any) {
      failed++;
      console.error(`❌ FAIL: ${name} -> ${err?.message || err}`);
    }
  }

  await test("12-Digit Assistant Code Provisioning: generates deterministic valid 12-digit codes", () => {
    const codeA = derive12DigitAssistantCode("kamrul.assistant@oxpecker.ai");
    const codeB = derive12DigitAssistantCode("kamrul.assistant@oxpecker.ai");
    const codeC = derive12DigitAssistantCode("aisha.assistant@oxpecker.ai");

    assert.equal(codeA, codeB);
    assert.notEqual(codeA, codeC);
    assert.equal(isValid12DigitCode(codeA), true);
    assert.equal(isValid12DigitCode("12345"), false);

    const docCode = deriveDoctorConnectCode("doc-ahmed-101");
    assert.ok(docCode.startsWith("DOC-"));
  });

  await test("Doctor -> Assistant Pairing Lifecycle: invite by 12-digit code, email fallback, accept & permissions", () => {
    const assistantCode = derive12DigitAssistantCode("pairing.test.ast@oxpecker.ai");

    // Invalid short numeric code rejected with 400
    const badInvite = createAssistantInvite({
      doctorId: "doc-test-777",
      doctorName: "Prof. Dr. Ahmed Rahman",
      doctorEmail: "ahmed@oxpecker.ai",
      assistantId: "12345",
      assistantEmail: "pairing.test.ast@oxpecker.ai",
    });
    assert.equal(badInvite.success, false);
    assert.equal(badInvite.status, 400);

    // Valid invite with granular permissions
    const inviteRes = createAssistantInvite({
      doctorId: "doc-test-777",
      doctorName: "Prof. Dr. Ahmed Rahman",
      doctorEmail: "ahmed@oxpecker.ai",
      assistantId: assistantCode,
      assistantEmail: "pairing.test.ast@oxpecker.ai",
      role: "Clinic Manager",
      permissions: { apt: true, queue: true, presc: false },
    });
    assert.equal(inviteRes.success, true);
    assert.equal(inviteRes.invite?.status, "pending");

    // Assistant fetches pending invites across devices via API state
    const astStateBefore = getAssistantPairingState({
      assistantId: assistantCode,
      assistantEmail: "pairing.test.ast@oxpecker.ai",
    });
    assert.ok(astStateBefore.pendingInvites.some((i) => i.id === inviteRes.invite?.id));

    // Assistant accepts invite
    const acceptRes = respondToAssistantInvite({
      inviteId: inviteRes.invite!.id,
      assistantId: assistantCode,
      assistantEmail: "pairing.test.ast@oxpecker.ai",
      assistantName: "Kamrul Hasan",
      status: "accepted",
    });
    assert.equal(acceptRes.success, true);
    assert.equal(acceptRes.invite?.status, "accepted");

    // Doctor sees assistant connected + real name + permissions
    const docState = getDoctorAssistantsState({ doctorId: "doc-test-777" });
    const linked = docState.connectedAssistants.find((a) => a.id === assistantCode);
    assert.ok(linked);
    assert.equal(linked?.name, "Kamrul Hasan");
    assert.equal(linked?.isPending, false);
    assert.equal(linked?.permissions.presc, false);

    // Assistant sees connected doctor name
    const astStateAfter = getAssistantPairingState({ assistantId: assistantCode });
    assert.equal(astStateAfter.connectedDoctor?.doctorName, "Prof. Dr. Ahmed Rahman");
  });

  await test("Bidirectional Connect by Doctor Code & Revocation with Dynamic Doctor Name", () => {
    const astCode = derive12DigitAssistantCode("direct.connect@oxpecker.ai");
    const docCode = deriveDoctorConnectCode("doc-test-888");

    const pairRes = connectAssistantByDoctorCode({
      assistantId: astCode,
      assistantName: "Aisha Begum",
      assistantEmail: "direct.connect@oxpecker.ai",
      doctorCodeOrEmail: docCode,
    });
    assert.equal(pairRes.success, true);
    assert.equal(pairRes.invite?.status, "accepted");

    // Revoke uses dynamic actor name instead of hardcoded "Dr. Sarah"
    const revokeRes = revokeAssistantConnection({
      doctorId: pairRes.invite!.doctorId,
      doctorName: "Dr. Nusrat Jahan",
      assistantId: astCode,
    });
    assert.ok(revokeRes.revokedCount >= 1);

    const astAfterRevoke = getAssistantPairingState({ assistantId: astCode });
    assert.equal(astAfterRevoke.connectedDoctor, null);
    assert.ok(
      astAfterRevoke.notifications.some(
        (n) => n.message.includes("Dr. Nusrat Jahan") && !n.message.includes("Dr. Sarah")
      )
    );
  });

  console.log(`\nDoctor-Assistant Pairing Suite: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runDoctorAssistantPairingTests();
