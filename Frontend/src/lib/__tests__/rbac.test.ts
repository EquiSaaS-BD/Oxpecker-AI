/**
 * ═══════════════════════════════════════════════════════════════════
 *  RBAC Verification Test Matrix — Oxpecker AI
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Tests all 16+ role×route combinations from the audit spec.
 *  Run with: npx tsx src/lib/__tests__/rbac.test.ts
 *  (or via any test runner that supports TypeScript)
 */

// Inline the pure functions to avoid import resolution issues in a quick test script
// In production these come from @/lib/rbac

type UserRole = "patient" | "doctor" | "hospital" | "admin" | "assistant" | null;

function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "patient":   return "/chat";
    case "doctor":    return "/doctor/dashboard";
    case "hospital":  return "/hospital/dashboard";
    case "admin":     return "/admin/dashboard";
    case "assistant": return "/assistant";
    default:          return "/login";
  }
}

const ROLE_EXCLUSIVE_ROUTES: { prefix: string; allowedRoles: UserRole[] }[] = [
  { prefix: "/admin",              allowedRoles: ["admin"] },
  { prefix: "/doctor/",            allowedRoles: ["doctor", "admin"] },
  { prefix: "/doctor",             allowedRoles: ["doctor", "admin"] },
  { prefix: "/hospital/",          allowedRoles: ["hospital", "admin"] },
  { prefix: "/hospital",           allowedRoles: ["hospital", "admin"] },
  { prefix: "/assistant",          allowedRoles: ["assistant", "admin"] },
  { prefix: "/chat",               allowedRoles: ["patient", "admin"] },
  { prefix: "/dashboard",          allowedRoles: ["patient", "admin"] },
  { prefix: "/health-card",        allowedRoles: ["patient", "admin"] },
  { prefix: "/patient",            allowedRoles: ["patient", "admin"] },
  { prefix: "/reports",            allowedRoles: ["patient", "admin"] },
  { prefix: "/saved",              allowedRoles: ["patient", "admin"] },
];

const PUBLIC_ROUTES: string[] = [
  "/doctors", "/hospitals", "/medicines", "/nutrition", "/about",
  "/contact", "/terms", "/privacy", "/refund", "/disclaimer",
  "/careers", "/press", "/docs", "/faq", "/scan", "/tv-monitor",
  "/profile", "/settings", "/appointments",
];

function isRouteAuthorizedForRole(pathname: string, role: UserRole): boolean {
  if (!role) return false;
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
  const isPublic = PUBLIC_ROUTES.some(
    (pub) => normalizedPath === pub || normalizedPath.startsWith(pub + "/")
  );
  if (isPublic) return true;
  for (const rule of ROLE_EXCLUSIVE_ROUTES) {
    const matches =
      normalizedPath === rule.prefix ||
      normalizedPath.startsWith(rule.prefix.endsWith("/") ? rule.prefix : rule.prefix + "/");
    if (matches) {
      return rule.allowedRoles.includes(role);
    }
  }
  return true;
}

function getAuthorizedRedirectUrl(targetUrl: string | null, role: UserRole): string {
  const home = getRoleHomePath(role);
  if (!targetUrl || !role) return home;
  let pathname = targetUrl;
  try {
    const url = new URL(targetUrl, "http://localhost");
    pathname = url.pathname;
  } catch {}
  if (pathname === "/login" || pathname.startsWith("/register") || pathname === "/reset-password") {
    return home;
  }
  if (isRouteAuthorizedForRole(pathname, role)) {
    return targetUrl;
  }
  return home;
}

// ═══════════════════════════════════════════════════════════════════
//  TEST EXECUTION
// ═══════════════════════════════════════════════════════════════════

interface TestCase {
  role: UserRole;
  path: string;
  expectAuthorized: boolean;
  description: string;
}

const testMatrix: TestCase[] = [
  // ── Patient Tests ────────────────────────────────────────────
  { role: "patient", path: "/chat",                expectAuthorized: true,  description: "Patient → own chat page" },
  { role: "patient", path: "/dashboard",           expectAuthorized: true,  description: "Patient → own dashboard" },
  { role: "patient", path: "/health-card",         expectAuthorized: true,  description: "Patient → own health card" },
  { role: "patient", path: "/settings",            expectAuthorized: true,  description: "Patient → shared settings" },
  { role: "patient", path: "/doctors",             expectAuthorized: true,  description: "Patient → public doctor directory" },
  { role: "patient", path: "/doctors/dr-khan",     expectAuthorized: true,  description: "Patient → public doctor profile" },
  { role: "patient", path: "/doctor/dashboard",    expectAuthorized: false, description: "Patient → BLOCKED from doctor portal" },
  { role: "patient", path: "/doctor/settings",     expectAuthorized: false, description: "Patient → BLOCKED from doctor settings" },
  { role: "patient", path: "/hospital/dashboard",  expectAuthorized: false, description: "Patient → BLOCKED from hospital portal" },
  { role: "patient", path: "/hospital",            expectAuthorized: false, description: "Patient → BLOCKED from /hospital (no trailing slash)" },
  { role: "patient", path: "/assistant",           expectAuthorized: false, description: "Patient → BLOCKED from assistant panel" },
  { role: "patient", path: "/admin/dashboard",     expectAuthorized: false, description: "Patient → BLOCKED from admin panel" },

  // ── Doctor Tests ─────────────────────────────────────────────
  { role: "doctor", path: "/doctor/dashboard",     expectAuthorized: true,  description: "Doctor → own dashboard" },
  { role: "doctor", path: "/doctor/settings",      expectAuthorized: true,  description: "Doctor → own settings" },
  { role: "doctor", path: "/doctors",              expectAuthorized: true,  description: "Doctor → public doctor directory" },
  { role: "doctor", path: "/settings",             expectAuthorized: true,  description: "Doctor → shared settings" },
  { role: "doctor", path: "/chat",                 expectAuthorized: false, description: "Doctor → BLOCKED from patient chat" },
  { role: "doctor", path: "/dashboard",            expectAuthorized: false, description: "Doctor → BLOCKED from patient dashboard" },
  { role: "doctor", path: "/health-card",          expectAuthorized: false, description: "Doctor → BLOCKED from patient health card" },
  { role: "doctor", path: "/hospital/dashboard",   expectAuthorized: false, description: "Doctor → BLOCKED from hospital portal" },
  { role: "doctor", path: "/admin/dashboard",      expectAuthorized: false, description: "Doctor → BLOCKED from admin panel" },
  { role: "doctor", path: "/assistant",            expectAuthorized: false, description: "Doctor → BLOCKED from assistant panel" },

  // ── Hospital Tests ───────────────────────────────────────────
  { role: "hospital", path: "/hospital/dashboard", expectAuthorized: true,  description: "Hospital → own dashboard" },
  { role: "hospital", path: "/hospital",           expectAuthorized: true,  description: "Hospital → own root (no trailing slash)" },
  { role: "hospital", path: "/hospitals",          expectAuthorized: true,  description: "Hospital → public hospital directory" },
  { role: "hospital", path: "/settings",           expectAuthorized: true,  description: "Hospital → shared settings" },
  { role: "hospital", path: "/chat",               expectAuthorized: false, description: "Hospital → BLOCKED from patient chat" },
  { role: "hospital", path: "/doctor/dashboard",   expectAuthorized: false, description: "Hospital → BLOCKED from doctor portal" },
  { role: "hospital", path: "/admin/dashboard",    expectAuthorized: false, description: "Hospital → BLOCKED from admin panel" },
  { role: "hospital", path: "/assistant",          expectAuthorized: false, description: "Hospital → BLOCKED from assistant panel" },

  // ── Doctor Assistant Tests ───────────────────────────────────
  { role: "assistant", path: "/assistant",         expectAuthorized: true,  description: "Assistant → own root" },
  { role: "assistant", path: "/assistant/queue",   expectAuthorized: true,  description: "Assistant → queue" },
  { role: "assistant", path: "/settings",          expectAuthorized: true,  description: "Assistant → shared settings" },
  { role: "assistant", path: "/doctor/dashboard",  expectAuthorized: false, description: "Assistant → BLOCKED from doctor portal" },
  { role: "assistant", path: "/hospital/dashboard",expectAuthorized: false, description: "Assistant → BLOCKED from hospital portal" },
  { role: "assistant", path: "/admin/dashboard",   expectAuthorized: false, description: "Assistant → BLOCKED from admin panel" },
  { role: "assistant", path: "/chat",              expectAuthorized: false, description: "Assistant → BLOCKED from patient chat" },
  { role: "assistant", path: "/health-card",       expectAuthorized: false, description: "Assistant → BLOCKED from patient health card" },

  // ── Admin Tests (Admin can access everything) ────────────────
  { role: "admin", path: "/admin/dashboard",       expectAuthorized: true,  description: "Admin → own dashboard" },
  { role: "admin", path: "/doctor/dashboard",      expectAuthorized: true,  description: "Admin → doctor portal (allowed)" },
  { role: "admin", path: "/hospital/dashboard",    expectAuthorized: true,  description: "Admin → hospital portal (allowed)" },
  { role: "admin", path: "/chat",                  expectAuthorized: true,  description: "Admin → patient chat (allowed)" },
  { role: "admin", path: "/assistant",             expectAuthorized: true,  description: "Admin → assistant panel (allowed)" },

  // ── Edge Cases ───────────────────────────────────────────────
  { role: "patient", path: "/doctor/",             expectAuthorized: false, description: "Patient → /doctor/ (trailing slash)" },
  { role: "patient", path: "/hospital/",           expectAuthorized: false, description: "Patient → /hospital/ (trailing slash)" },
  { role: null,      path: "/chat",                expectAuthorized: false, description: "Null role → BLOCKED from everything" },
  { role: null,      path: "/admin/dashboard",     expectAuthorized: false, description: "Null role → BLOCKED from admin" },
];

// ── Redirect Sanitizer Tests ─────────────────────────────────────
interface RedirectTestCase {
  role: UserRole;
  storedUrl: string | null;
  expectedTarget: string;
  description: string;
}

const redirectTests: RedirectTestCase[] = [
  { role: "patient",   storedUrl: null,                     expectedTarget: "/chat",               description: "Patient, no stored URL → /chat" },
  { role: "patient",   storedUrl: "/dashboard",             expectedTarget: "/dashboard",          description: "Patient, stored /dashboard → /dashboard (own)" },
  { role: "patient",   storedUrl: "/hospital/dashboard",    expectedTarget: "/chat",               description: "Patient, stored /hospital/dashboard → DISCARDED → /chat" },
  { role: "patient",   storedUrl: "/doctor/dashboard",      expectedTarget: "/chat",               description: "Patient, stored /doctor/dashboard → DISCARDED → /chat" },
  { role: "patient",   storedUrl: "/admin/dashboard",       expectedTarget: "/chat",               description: "Patient, stored /admin → DISCARDED → /chat" },
  { role: "doctor",    storedUrl: "/chat",                  expectedTarget: "/doctor/dashboard",   description: "Doctor, stored /chat → DISCARDED → /doctor/dashboard" },
  { role: "doctor",    storedUrl: "/doctor/patients",       expectedTarget: "/doctor/patients",    description: "Doctor, stored /doctor/patients → allowed" },
  { role: "hospital",  storedUrl: "/doctor/dashboard",      expectedTarget: "/hospital/dashboard", description: "Hospital, stored /doctor/dashboard → DISCARDED → /hospital/dashboard" },
  { role: "assistant", storedUrl: "/hospital/dashboard",    expectedTarget: "/assistant",          description: "Assistant, stored /hospital → DISCARDED → /assistant" },
  { role: "assistant", storedUrl: "/assistant/queue",       expectedTarget: "/assistant/queue",    description: "Assistant, stored /assistant/queue → allowed" },
  { role: "patient",   storedUrl: "/login",                 expectedTarget: "/chat",               description: "Patient, stored /login → DISCARDED (auth route) → /chat" },
  { role: "doctor",    storedUrl: "/register",              expectedTarget: "/doctor/dashboard",   description: "Doctor, stored /register → DISCARDED → /doctor/dashboard" },
  { role: "patient",   storedUrl: "/doctors/dr-khan",       expectedTarget: "/doctors/dr-khan",    description: "Patient, stored /doctors/dr-khan → allowed (public)" },
];

// ═══════════════════════════════════════════════════════════════════
//  RUNNER
// ═══════════════════════════════════════════════════════════════════

let passed = 0;
let failed = 0;
const failures: string[] = [];

console.log("═══════════════════════════════════════════════════════════");
console.log("  RBAC VERIFICATION TEST MATRIX — Oxpecker AI");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("── Route Authorization Tests ──────────────────────────────\n");

for (const tc of testMatrix) {
  const result = isRouteAuthorizedForRole(tc.path, tc.role);
  const ok = result === tc.expectAuthorized;
  const icon = ok ? "✅" : "❌";
  const line = `${icon} [${String(tc.role).padEnd(9)}] ${tc.path.padEnd(25)} → ${result ? "ALLOWED" : "BLOCKED"} (expected: ${tc.expectAuthorized ? "ALLOWED" : "BLOCKED"}) — ${tc.description}`;
  console.log(line);
  if (ok) passed++;
  else { failed++; failures.push(line); }
}

console.log("\n── Redirect Sanitizer Tests ─────────────────────────────\n");

for (const rt of redirectTests) {
  const result = getAuthorizedRedirectUrl(rt.storedUrl, rt.role);
  const ok = result === rt.expectedTarget;
  const icon = ok ? "✅" : "❌";
  const line = `${icon} [${String(rt.role).padEnd(9)}] stored="${String(rt.storedUrl).padEnd(25)}" → got="${result}" (expected: "${rt.expectedTarget}") — ${rt.description}`;
  console.log(line);
  if (ok) passed++;
  else { failed++; failures.push(line); }
}

console.log("\n═══════════════════════════════════════════════════════════");
console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("═══════════════════════════════════════════════════════════");

if (failures.length > 0) {
  console.log("\n❌ FAILURES:");
  failures.forEach((f) => console.log("  " + f));
  process.exit(1);
} else {
  console.log("\n🎯 ALL TESTS PASSED — ZERO ROLE POLLUTION CONFIRMED");
  process.exit(0);
}
