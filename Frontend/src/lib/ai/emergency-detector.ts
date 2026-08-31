/**
 * Oxpecker AI - Emergency Detector
 * Scans user messages for emergency keywords in English & Bangla
 * Triggers immediate alert UI when detected
 */

export interface EmergencyDetection {
  isEmergency: boolean;
  condition: string;
  severity: 'warning' | 'critical';
  message: string;
  callNumber: string;
  firstAid: string[];
}

// Emergency keyword patterns (English + Bangla)
const EMERGENCY_PATTERNS: {
  keywords: (string | RegExp)[];
  condition: string;
  severity: 'warning' | 'critical';
  message: string;
  firstAid: string[];
}[] = [
  {
    keywords: ['heart attack', 'chest pain', 'বুকে ব্যথা', 'হার্ট অ্যাটাক', 'হার্ট এটাক', 'বুকে চাপ'],
    condition: 'Suspected Heart Attack / Chest Pain',
    severity: 'critical',
    message: 'Call emergency services (999) immediately. Do not wait.',
    firstAid: [
      'Sit or lie down in a comfortable position',
      'Chew an aspirin (300mg) if available and not allergic',
      'Loosen tight clothing',
      'Stay calm and avoid physical activity',
      'Call 999 or go to nearest hospital immediately',
    ],
  },
  {
    keywords: ['stroke', 'স্ট্রোক', 'face drooping', 'মুখ বেঁকে', 'arm weakness', 'speech difficulty', 'কথা জড়িয়ে'],
    condition: 'Suspected Stroke',
    severity: 'critical',
    message: 'FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 999.',
    firstAid: [
      'Note the time symptoms started',
      'Do NOT give any food or water',
      'Lay the person on their side',
      'Keep them calm and still',
      'Call 999 immediately - every minute counts',
    ],
  },
  {
    keywords: ['can\'t breathe', 'difficulty breathing', 'শ্বাস নিতে পারছি না', 'শ্বাসকষ্ট', 'suffocating', 'choking', 'গলায় আটকে'],
    condition: 'Breathing Difficulty / Choking',
    severity: 'critical',
    message: 'Seek immediate medical help. Call 999.',
    firstAid: [
      'Sit upright - do not lie down',
      'If choking: perform Heimlich maneuver',
      'Loosen clothing around neck and chest',
      'Use inhaler if available (for asthma)',
      'Open windows for fresh air',
      'Call 999 if condition worsens',
    ],
  },
  {
    keywords: ['heavy bleeding', 'অতিরিক্ত রক্তপাত', 'রক্ত বন্ধ হচ্ছে না', 'blood won\'t stop', 'severe bleeding'],
    condition: 'Severe Bleeding',
    severity: 'critical',
    message: 'Apply direct pressure to wound. Call 999 immediately.',
    firstAid: [
      'Apply firm, direct pressure with a clean cloth',
      'Do NOT remove the cloth - add more layers if needed',
      'Elevate the injured area above heart level',
      'Apply a tourniquet if bleeding is from a limb and won\'t stop',
      'Keep the person warm and still',
      'Call 999 immediately',
    ],
  },
  {
    keywords: ['seizure', 'খিঁচুনি', 'convulsion', 'fitting', 'মৃগী রোগ'],
    condition: 'Seizure / Convulsion',
    severity: 'critical',
    message: 'Do not restrain. Clear the area. Call 999 if seizure lasts >5 minutes.',
    firstAid: [
      'Clear hard objects from around the person',
      'Do NOT put anything in their mouth',
      'Do NOT try to hold them down',
      'Place something soft under their head',
      'Turn them on their side after seizure stops',
      'Time the seizure - call 999 if >5 minutes',
    ],
  },
  {
    keywords: ['unconscious', 'অজ্ঞান', 'জ্ঞান হারিয়ে', 'passed out', 'not responding', 'fainted'],
    condition: 'Loss of Consciousness',
    severity: 'critical',
    message: 'Check breathing. Place in recovery position. Call 999.',
    firstAid: [
      'Check if the person is breathing',
      'If not breathing: start CPR (30 compressions, 2 breaths)',
      'If breathing: place in recovery position (on their side)',
      'Do NOT give food or water',
      'Call 999 immediately',
    ],
  },
  {
    keywords: ['severe allergic reaction', 'anaphylaxis', 'swelling throat', 'throat closing', 'অ্যানাফাইলাক্সিস', 'তীব্র অ্যালার্জি', 'শ্বাসকষ্টসহ অ্যালার্জি', 'গলা ফুলে শ্বাস বন্ধ'],
    condition: 'Severe Allergic Reaction / Anaphylaxis',
    severity: 'critical',
    message: 'Use EpiPen if available. Call 999 immediately.',
    firstAid: [
      'Use EpiPen/epinephrine auto-injector if available',
      'Lay the person flat (raise legs if possible)',
      'If breathing is difficult, let them sit up',
      'Remove the allergen if known',
      'Give antihistamine if conscious',
      'Call 999 - anaphylaxis can be fatal',
    ],
  },
  {
    keywords: ['poisoning', 'বিষ খেয়েছে', 'poison', 'overdose', 'ওভারডোজ', 'বিষক্রিয়া'],
    condition: 'Poisoning / Overdose',
    severity: 'critical',
    message: 'Do NOT induce vomiting. Call Poison Control or 999.',
    firstAid: [
      'Do NOT make the person vomit',
      'If conscious, rinse mouth with water',
      'Save the poison container/medicine for identification',
      'Note the time and amount consumed',
      'Call 999 or Poison Control immediately',
    ],
  },
  {
    keywords: ['baby high fever', 'infant high fever', 'বাচ্চার উচ্চ জ্বর', 'শিশুর উচ্চ জ্বর', 'নবজাতকের জ্বর', 'বাচ্চার তীব্র জ্বর', 'infant fever >100'],
    condition: 'High Fever in Infant',
    severity: 'critical',
    message: 'For babies under 3 months with fever >100.4°F: seek emergency care immediately.',
    firstAid: [
      'Remove excess clothing',
      'Give age-appropriate fever medicine (paracetamol)',
      'Sponge with lukewarm (NOT cold) water',
      'Ensure baby is hydrated',
      'Monitor temperature every 30 minutes',
      'Go to ER immediately if baby is <3 months old',
    ],
  },
  {
    keywords: ['suicide', 'kill myself', 'want to die', 'আত্মহত্যা', 'মরে যেতে চাই', 'বেঁচে থাকতে চাই না'],
    condition: 'Mental Health Crisis',
    severity: 'critical',
    message: 'You are not alone. Please call the Kaan Pete Roi helpline: 01779-554391',
    firstAid: [
      'You matter. Your feelings are valid.',
      'Talk to someone you trust right now',
      'Call Kaan Pete Roi: 01779-554391 (24/7)',
      'Call National Emergency: 999',
      'Do not be alone - reach out to family or friends',
      'This is temporary - help is available',
    ],
  },
];

/**
 * Scans a message for emergency keywords
 * Returns detection result or null if no emergency found
 */
export function detectEmergency(message: string): EmergencyDetection | null {
  const lowerMessage = message.toLowerCase();

  for (const pattern of EMERGENCY_PATTERNS) {
    for (const keyword of pattern.keywords) {
      const matches = keyword instanceof RegExp
        ? keyword.test(lowerMessage)
        : lowerMessage.includes(keyword.toLowerCase());

      if (matches) {
        return {
          isEmergency: true,
          condition: pattern.condition,
          severity: pattern.severity,
          message: pattern.message,
          callNumber: '999',
          firstAid: pattern.firstAid,
        };
      }
    }
  }

  return null;
}
