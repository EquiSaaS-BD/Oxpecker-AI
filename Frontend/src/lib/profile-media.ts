const AVATAR_PREFIX = "oxpecker_profile_avatar_";
export const PROFILE_AVATAR_EVENT = "oxpecker:profile-avatar-updated";

function normEmail(email?: string | null): string {
  return String(email || "").trim().toLowerCase();
}

export function getPersistedUserAvatar(id?: string | null, email?: string | null): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return null;
  try {
    const cleanEmail = normEmail(email);
    if (cleanEmail) {
      const byEmail = localStorage.getItem(`${AVATAR_PREFIX}${cleanEmail}`);
      if (byEmail && byEmail.trim()) return byEmail;
    }
    if (id) {
      const byId = localStorage.getItem(`${AVATAR_PREFIX}${id}`);
      if (byId && byId.trim()) return byId;

      const cardRaw = localStorage.getItem(`hp_card_${id}`);
      if (cardRaw) {
        const parsed = JSON.parse(cardRaw);
        if (typeof parsed?.patient_image === "string" && parsed.patient_image.trim()) {
          return parsed.patient_image;
        }
      }

      const profRaw = localStorage.getItem(`hp_profile_${id}`);
      if (profRaw) {
        const parsed = JSON.parse(profRaw);
        if (typeof parsed?.image === "string" && parsed.image.trim()) {
          return parsed.image;
        }
      }
    }
  } catch {}
  return null;
}

export function saveUserAvatarEverywhere(params: {
  id?: string | null;
  email?: string | null;
  image: string;
}): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  const { id, email, image } = params;
  if (!image || !image.trim()) return;

  const cleanEmail = normEmail(email);

  try {
    if (cleanEmail) {
      localStorage.setItem(`${AVATAR_PREFIX}${cleanEmail}`, image);
    }
    if (id) {
      localStorage.setItem(`${AVATAR_PREFIX}${id}`, image);
    }

    for (const key of ["oxpecker_mock_user", "oxpecker_user"]) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          ((id && parsed.id === id) || (cleanEmail && normEmail(parsed.email) === cleanEmail))
        ) {
          parsed.image = image;
          localStorage.setItem(key, JSON.stringify(parsed));
        }
      } catch {}
    }

    if (id) {
      try {
        const profKey = `hp_profile_${id}`;
        const raw = localStorage.getItem(profKey);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.image = image;
        localStorage.setItem(profKey, JSON.stringify(parsed));
      } catch {}
    }

    const cardKeys = new Set<string>(["hp_card_current"]);
    if (id) cardKeys.add(`hp_card_${id}`);
    for (const cardKey of cardKeys) {
      try {
        const raw = localStorage.getItem(cardKey);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.patient_image = image;
        parsed.photo_url = image;
        localStorage.setItem(cardKey, JSON.stringify(parsed));
      } catch {}
    }

    try {
      const cardsRaw = localStorage.getItem("oxpecker_healthpass_cards");
      if (cardsRaw) {
        const cards = JSON.parse(cardsRaw);
        if (Array.isArray(cards)) {
          let modified = false;
          for (let i = 0; i < cards.length; i++) {
            const c = cards[i];
            if (!c || typeof c !== "object") continue;
            const matches =
              (id && (c.patient_id === id || c.user_id === id)) ||
              (cleanEmail && normEmail(c.email) === cleanEmail) ||
              (i === 0 && (id === "usr-pat-01" || cleanEmail === "patient@oxpecker.ai"));
            if (matches) {
              cards[i] = { ...c, patient_image: image, photo_url: image };
              modified = true;
            }
          }
          if (modified) {
            localStorage.setItem("oxpecker_healthpass_cards", JSON.stringify(cards));
          }
        }
      }
    } catch {}

    window.dispatchEvent(
      new CustomEvent(PROFILE_AVATAR_EVENT, {
        detail: { id: id || null, email: cleanEmail || null, image },
      })
    );
  } catch {}
}
