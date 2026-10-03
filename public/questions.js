// Soter AI — Parent/Guardian/Child Communication & Generational Gap Survey
// Structured question model (spec section 15). Rendered dynamically by survey.js.
//
// Branches: parent, guardian, child_8_10, child_11_13, child_14_16, child_17_18
// Item types: section | radio | checkbox | textarea | toggle | contact | consent
// All copy is neutral, international, research-oriented and age-appropriate.

window.SURVEY_MODEL = {};

// ---- Entry: "Who are you?" ----
window.SURVEY_MODEL.entryRole = {
  type: 'radio',
  qid: 'entry-role',
  section: 'Welcome',
  entry: true,
  cards: true,
  label: 'Who are you?',
  hint: 'Before we begin, tell us who you are so we can ask the right questions. This short survey explores communication, understanding and experiences across generations.',
  note: 'Your response is voluntary and confidential. You can answer anonymously — the survey takes you through a few short sections, and you can go back at any time.',
  options: [
    { value: 'parent', title: 'Parent', desc: 'I am a parent of one or more children' },
    { value: 'guardian', title: 'Guardian', desc: 'I am a guardian or carer for a child or young person' },
    { value: 'child', title: 'Child / Young Person', desc: 'I am under 18 and answering for myself' }
  ],
  required: true,
  error: 'Please select who you are.'
};

// ---- Entry: age group (child branch only) ----
window.SURVEY_MODEL.entryAge = {
  type: 'radio',
  qid: 'entry-age',
  section: 'Welcome',
  entry: true,
  cards: true,
  cardsTwoCol: true,
  label: 'What is your age group?',
  hint: 'Choose the age range you are in. We only use this to ask questions that suit your age — we do not need your date of birth.',
  options: [
    { value: '8-10', title: '8–10 years' },
    { value: '11-13', title: '11–13 years' },
    { value: '14-16', title: '14–16 years' },
    { value: '17-18', title: '17–18 years' }
  ],
  required: true,
  error: 'Please select your age group.'
};

// ---- Privacy tail: adults (anonymous toggle + optional contact) ----
window.SURVEY_MODEL.privacyAdult = [
  {
    type: 'section',
    qid: 's-privacy',
    section: 'Privacy',
    title: 'Privacy',
    intro: 'A few final details before you send your response.',
    notice: 'Your response is voluntary. Please do not include your child’s full name, address, phone number, passwords, or other information that could directly identify you or your child.'
  },
  {
    type: 'toggle',
    qid: 'q-anonymous',
    section: 'Privacy',
    label: 'Submit anonymously'
  },
  {
    type: 'contact',
    qid: 'q-contact',
    section: 'Privacy',
    when: 'not-anonymous',
    label: 'Your contact details (optional)',
    hint: 'Only provide contact information if you are comfortable being contacted about the study.'
  },
  {
    type: 'consent',
    qid: 'q-consent',
    section: 'Privacy',
    label: 'Consent',
    hint: 'Required to submit.',
    consentLabel: 'I understand that my response is voluntary and may be used to inform Soter AI research and development.',
    required: true,
    error: 'Please confirm you understand before submitting.'
  }
];

// ---- Privacy tail: children (always anonymous, no contact fields) ----
window.SURVEY_MODEL.privacyChild = [
  {
    type: 'section',
    qid: 's-privacy',
    section: 'Privacy',
    title: 'Privacy',
    intro: 'One last thing before you send your response.',
    notice: 'Your response is anonymous. Please do not include your full name, address, phone number, or anything that could identify you.'
  },
  {
    type: 'consent',
    qid: 'q-consent',
    section: 'Privacy',
    label: 'Consent',
    hint: 'Required to submit.',
    consentLabel: 'I understand that my response is voluntary and may be used to inform Soter AI research and development.',
    required: true,
    error: 'Please confirm you understand before submitting.'
  }
];

// ---- Branch: Parent ----
window.SURVEY_MODEL.parent = [
  {
    type: 'section',
    qid: 's-home',
    section: 'Communication at home',
    title: 'Communication at home',
    intro: 'These questions are about everyday conversation between you and your child.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'p-frequency',
    section: 'Communication at home',
    label: 'How often do you have a relaxed conversation with your child — one where neither of you is in a hurry?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few-week', label: 'A few times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'p-topics',
    section: 'Communication at home',
    label: 'Which topics come up most often when you and your child talk?',
    hint: 'Select the one that fits best.',
    options: [
      { value: 'school', label: 'School or homework' },
      { value: 'rules', label: 'Rules and responsibilities' },
      { value: 'feelings', label: 'Feelings and relationships' },
      { value: 'plans', label: 'Plans and activities' },
      { value: 'screen', label: 'Screens, games or social media' },
      { value: 'other', label: 'Something else' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'checkbox',
    qid: 'p-barriers',
    section: 'Communication at home',
    label: 'What makes it hardest to talk openly with your child?',
    hint: 'Select all that apply.',
    options: [
      { value: 'time', label: 'Not enough time' },
      { value: 'mood', label: 'One of us is tired or stressed' },
      { value: 'devices', label: 'Phones, games or other devices' },
      { value: 'topic', label: 'The topic feels sensitive' },
      { value: 'clash', label: 'We disagree too quickly' },
      { value: 'none', label: 'Nothing really gets in the way' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'p-listen',
    section: 'Communication at home',
    label: 'When your child disagrees with you, how heard do you think they feel?',
    options: [
      { value: 'very', label: 'Very heard' },
      { value: 'somewhat', label: 'Somewhat heard' },
      { value: 'slightly', label: 'Slightly heard' },
      { value: 'not', label: 'Not heard at all' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'p-misunderstood',
    section: 'Communication at home',
    label: 'Describe a recent moment when you and your child misunderstood each other.',
    hint: 'Optional — a sentence or two is enough. Please do not use names.',
    placeholder: 'For example: We both wanted different plans for the weekend…',
    required: false
  },
  {
    type: 'section',
    qid: 's-tools',
    section: 'Communication tools',
    title: 'Communication tools',
    intro: 'A few questions about how you stay in touch and the role technology plays.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'p-channels',
    section: 'Communication tools',
    label: 'How do you and your child usually talk when you are in different places?',
    options: [
      { value: 'call', label: 'Phone calls' },
      { value: 'text', label: 'Text or chat messages' },
      { value: 'video', label: 'Video calls' },
      { value: 'inperson', label: 'We rarely talk when apart' },
      { value: 'other', label: 'Something else' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'p-tech',
    section: 'Communication tools',
    label: 'Do you think technology brings you and your child closer together or pushes you apart?',
    options: [
      { value: 'closer', label: 'Brings us closer' },
      { value: 'neither', label: 'Neither closer nor apart' },
      { value: 'apart', label: 'Pushes us apart' },
      { value: 'unsure', label: 'I am not sure' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'p-boundaries',
    section: 'Communication tools',
    label: 'How clear are the rules about phones and devices in your home?',
    options: [
      { value: 'very', label: 'Very clear' },
      { value: 'mostly', label: 'Mostly clear' },
      { value: 'loose', label: 'Loose or flexible' },
      { value: 'none', label: 'We do not really have rules' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'p-improve',
    section: 'Communication tools',
    label: 'If one thing could make communication with your child easier, what would it be?',
    hint: 'Optional — a sentence or two is enough.',
    placeholder: 'For example: A quiet time each evening to talk…',
    required: false
  },
  {
    type: 'section',
    qid: 's-generation',
    section: 'Generational perspectives',
    title: 'Generational perspectives',
    intro: 'These questions ask about your views on growing up today compared with your own childhood.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'p-gap',
    section: 'Generational perspectives',
    label: 'Compared with when you were your child’s age, how large is the gap between your experiences?',
    options: [
      { value: 'much', label: 'Much larger' },
      { value: 'somewhat', label: 'Somewhat larger' },
      { value: 'same', label: 'About the same' },
      { value: 'smaller', label: 'Smaller than I expected' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'p-understand',
    section: 'Generational perspectives',
    label: 'How well do you feel you understand the world your child is growing up in?',
    options: [
      { value: 'very', label: 'Very well' },
      { value: 'mostly', label: 'Mostly well' },
      { value: 'partly', label: 'Partly' },
      { value: 'not', label: 'Not very well' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'p-values',
    section: 'Generational perspectives',
    label: 'Which statement best describes your view of your child’s generation?',
    options: [
      { value: 'difficult', label: 'It faces pressures mine did not' },
      { value: 'advantage', label: 'It has advantages mine did not' },
      { value: 'similar', label: 'It is not so different from mine' },
      { value: 'unsure', label: 'I do not feel able to judge' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'p-wish',
    section: 'Generational perspectives',
    label: 'Is there something you wish your child understood about your own upbringing?',
    hint: 'Optional — a sentence or two is enough.',
    placeholder: 'For example: When I was young, we…',
    required: false
  },
  {
    type: 'section',
    qid: 's-hopes',
    section: 'Hopes and future',
    title: 'Hopes and future',
    intro: 'The last few questions are about your hopes for your child and for family communication.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'checkbox',
    qid: 'p-hopes',
    section: 'Hopes and future',
    label: 'What do you hope most for your child?',
    hint: 'Select all that apply.',
    options: [
      { value: 'happiness', label: 'Happiness and wellbeing' },
      { value: 'confidence', label: 'Confidence and independence' },
      { value: 'kindness', label: 'Kindness and strong relationships' },
      { value: 'success', label: 'School or career success' },
      { value: 'resilience', label: 'Resilience through difficulty' },
      { value: 'balance', label: 'A healthy balance with technology' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'p-future',
    section: 'Hopes and future',
    label: 'How optimistic are you that communication with your child will improve over the next year?',
    options: [
      { value: 'very', label: 'Very optimistic' },
      { value: 'somewhat', label: 'Somewhat optimistic' },
      { value: 'neutral', label: 'Neither optimistic nor pessimistic' },
      { value: 'pessimistic', label: 'Pessimistic' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'p-final',
    section: 'Hopes and future',
    label: 'Before you finish, is there anything else you would like to share about communication across generations?',
    hint: 'Optional — please do not use names or other identifying details.',
    placeholder: 'Your thoughts…',
    required: false
  }
];

// ---- Branch: Guardian ----
window.SURVEY_MODEL.guardian = [
  {
    type: 'section',
    qid: 's-home',
    section: 'Communication at home',
    title: 'Communication at home',
    intro: 'These questions are about everyday conversation with the child or young person in your care.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'g-frequency',
    section: 'Communication at home',
    label: 'How often do you have a relaxed conversation with the child or young person in your care?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few-week', label: 'A few times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'g-topics',
    section: 'Communication at home',
    label: 'Which topics come up most often when you talk?',
    hint: 'Select the one that fits best.',
    options: [
      { value: 'school', label: 'School or homework' },
      { value: 'rules', label: 'Rules and responsibilities' },
      { value: 'feelings', label: 'Feelings and relationships' },
      { value: 'plans', label: 'Plans and activities' },
      { value: 'screen', label: 'Screens, games or social media' },
      { value: 'other', label: 'Something else' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'checkbox',
    qid: 'g-barriers',
    section: 'Communication at home',
    label: 'What makes it hardest to talk openly with them?',
    hint: 'Select all that apply.',
    options: [
      { value: 'time', label: 'Not enough time' },
      { value: 'mood', label: 'One of us is tired or stressed' },
      { value: 'devices', label: 'Phones, games or other devices' },
      { value: 'topic', label: 'The topic feels sensitive' },
      { value: 'clash', label: 'We disagree too quickly' },
      { value: 'none', label: 'Nothing really gets in the way' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'g-listen',
    section: 'Communication at home',
    label: 'When you disagree, how heard do you think they feel?',
    options: [
      { value: 'very', label: 'Very heard' },
      { value: 'somewhat', label: 'Somewhat heard' },
      { value: 'slightly', label: 'Slightly heard' },
      { value: 'not', label: 'Not heard at all' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'g-misunderstood',
    section: 'Communication at home',
    label: 'Describe a recent moment when you and the child or young person in your care misunderstood each other.',
    hint: 'Optional — a sentence or two is enough. Please do not use names.',
    placeholder: 'For example: We both expected different things about…',
    required: false
  },
  {
    type: 'section',
    qid: 's-role',
    section: 'Your role',
    title: 'Your role',
    intro: 'These questions are about your experience as a guardian or carer.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'g-support',
    section: 'Your role',
    label: 'How supported do you feel in your role as a guardian or carer?',
    options: [
      { value: 'very', label: 'Very supported' },
      { value: 'mostly', label: 'Mostly supported' },
      { value: 'little', label: 'A little supported' },
      { value: 'not', label: 'Not supported' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'checkbox',
    qid: 'g-challenges',
    section: 'Your role',
    label: 'What are the biggest challenges in your role?',
    hint: 'Select all that apply.',
    options: [
      { value: 'behaviour', label: 'Behaviour or emotions' },
      { value: 'school', label: 'School or education' },
      { value: 'boundaries', label: 'Setting boundaries' },
      { value: 'time', label: 'Time and energy' },
      { value: 'services', label: 'Accessing services or support' },
      { value: 'none', label: 'No particular challenge' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'g-relationship',
    section: 'Your role',
    label: 'How would you describe your relationship with the child or young person in your care?',
    options: [
      { value: 'close', label: 'Close and open' },
      { value: 'mostly', label: 'Mostly positive' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'distant', label: 'Distant or strained' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'g-support-wish',
    section: 'Your role',
    label: 'What support would make the biggest difference to you as a guardian or carer?',
    hint: 'Optional — a sentence or two is enough.',
    placeholder: 'For example: More regular contact with…',
    required: false
  },
  {
    type: 'section',
    qid: 's-tools',
    section: 'Communication tools',
    title: 'Communication tools',
    intro: 'A few questions about how you stay in touch and the role technology plays.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'g-channels',
    section: 'Communication tools',
    label: 'How do you usually talk when you are in different places?',
    options: [
      { value: 'call', label: 'Phone calls' },
      { value: 'text', label: 'Text or chat messages' },
      { value: 'video', label: 'Video calls' },
      { value: 'inperson', label: 'We rarely talk when apart' },
      { value: 'other', label: 'Something else' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'g-tech',
    section: 'Communication tools',
    label: 'Do you think technology brings you closer together or pushes you apart?',
    options: [
      { value: 'closer', label: 'Brings us closer' },
      { value: 'neither', label: 'Neither closer nor apart' },
      { value: 'apart', label: 'Pushes us apart' },
      { value: 'unsure', label: 'I am not sure' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'g-boundaries',
    section: 'Communication tools',
    label: 'How clear are the rules about phones and devices?',
    options: [
      { value: 'very', label: 'Very clear' },
      { value: 'mostly', label: 'Mostly clear' },
      { value: 'loose', label: 'Loose or flexible' },
      { value: 'none', label: 'We do not really have rules' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'section',
    qid: 's-generation',
    section: 'Generational perspectives',
    title: 'Generational perspectives',
    intro: 'These questions ask about your views on growing up today compared with your own childhood.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'radio',
    qid: 'g-gap',
    section: 'Generational perspectives',
    label: 'Compared with when you were their age, how large is the gap between your experiences?',
    options: [
      { value: 'much', label: 'Much larger' },
      { value: 'somewhat', label: 'Somewhat larger' },
      { value: 'same', label: 'About the same' },
      { value: 'smaller', label: 'Smaller than I expected' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'g-understand',
    section: 'Generational perspectives',
    label: 'How well do you feel you understand the world they are growing up in?',
    options: [
      { value: 'very', label: 'Very well' },
      { value: 'mostly', label: 'Mostly well' },
      { value: 'partly', label: 'Partly' },
      { value: 'not', label: 'Not very well' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'g-wish',
    section: 'Generational perspectives',
    label: 'Is there something you wish they understood about your own upbringing?',
    hint: 'Optional — a sentence or two is enough.',
    placeholder: 'For example: When I was young, we…',
    required: false
  },
  {
    type: 'section',
    qid: 's-hopes',
    section: 'Hopes and future',
    title: 'Hopes and future',
    intro: 'The last few questions are about your hopes for the child or young person in your care.',
    notice: 'There are no right or wrong answers — please answer honestly.'
  },
  {
    type: 'checkbox',
    qid: 'g-hopes',
    section: 'Hopes and future',
    label: 'What do you hope most for them?',
    hint: 'Select all that apply.',
    options: [
      { value: 'happiness', label: 'Happiness and wellbeing' },
      { value: 'confidence', label: 'Confidence and independence' },
      { value: 'kindness', label: 'Kindness and strong relationships' },
      { value: 'success', label: 'School or career success' },
      { value: 'resilience', label: 'Resilience through difficulty' },
      { value: 'balance', label: 'A healthy balance with technology' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'textarea',
    qid: 'g-final',
    section: 'Hopes and future',
    label: 'Before you finish, is there anything else you would like to share about communication across generations?',
    hint: 'Optional — please do not use names or other identifying details.',
    placeholder: 'Your thoughts…',
    required: false
  }
];

// ---- Branch: Child 8–10 (always anonymous) ----
window.SURVEY_MODEL.child_8_10 = [
  {
    type: 'section',
    qid: 's-home',
    section: 'Talking at home',
    title: 'Talking at home',
    intro: 'These questions are about talking with the grown ups at home.',
    notice: 'There are no right or wrong answers. Your answers are private.'
  },
  {
    type: 'radio',
    qid: 'c8-frequency',
    section: 'Talking at home',
    label: 'How often do you talk with a grown up at home about your day?',
    options: [
      { value: 'daily', label: 'Every day' },
      { value: 'few-week', label: 'A few times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'rarely', label: 'Not very often' },
      { value: 'never', label: 'Almost never' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'radio',
    qid: 'c8-listen',
    section: 'Talking at home',
    label: 'When you tell a grown up how you feel, how well do you think they listen?',
    options: [
      { value: 'very', label: 'They listen really well' },
      { value: 'okay', label: 'They listen okay' },
      { value: 'little', label: 'They listen a little' },
      { value: 'not', label: 'They do not listen much' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'radio',
    qid: 'c8-hardtopic',
    section: 'Talking at home',
    label: 'Is there something you find hard to talk about with a grown up at home?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'no', label: 'No' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'textarea',
    qid: 'c8-hint',
    section: 'Talking at home',
    label: 'What would make talking with grown ups at home easier for you?',
    hint: 'Optional — you can write as much or as little as you like.',
    placeholder: 'For example: More time before bed…',
    required: false
  },
  {
    type: 'section',
    qid: 's-devices',
    section: 'Screens and games',
    title: 'Screens and games',
    intro: 'Now some questions about phones, tablets, games and TV.',
    notice: 'There are no right or wrong answers. Your answers are private.'
  },
  {
    type: 'radio',
    qid: 'c8-devices',
    section: 'Screens and games',
    label: 'Which do you use most?',
    options: [
      { value: 'tablet', label: 'A tablet' },
      { value: 'phone', label: 'A phone' },
      { value: 'console', label: 'A games console' },
      { value: 'tv', label: 'A TV' },
      { value: 'computer', label: 'A computer' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'radio',
    qid: 'c8-rules',
    section: 'Screens and games',
    label: 'How clear are the rules about screen time at home?',
    options: [
      { value: 'very', label: 'Very clear' },
      { value: 'okay', label: 'Sort of clear' },
      { value: 'loose', label: 'They change a lot' },
      { value: 'none', label: 'There are no rules' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'radio',
    qid: 'c8-tech',
    section: 'Screens and games',
    label: 'Do screens help you and your family do things together, or get in the way?',
    options: [
      { value: 'together', label: 'They help us do things together' },
      { value: 'neither', label: 'Neither' },
      { value: 'way', label: 'They get in the way' },
      { value: 'unsure', label: 'I am not sure' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'section',
    qid: 's-generation',
    section: 'Then and now',
    title: 'Then and now',
    intro: 'A few questions about being a kid today versus when your grown ups were young.',
    notice: 'There are no right or wrong answers. Your answers are private.'
  },
  {
    type: 'radio',
    qid: 'c8-gap',
    section: 'Then and now',
    label: 'Do you think being a kid today is very different from when your grown ups were kids?',
    options: [
      { value: 'very', label: 'Very different' },
      { value: 'some', label: 'A bit different' },
      { value: 'same', label: 'About the same' },
      { value: 'unsure', label: 'I do not know' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'radio',
    qid: 'c8-understand',
    section: 'Then and now',
    label: 'How well do your grown ups understand the things you care about?',
    options: [
      { value: 'very', label: 'Really well' },
      { value: 'mostly', label: 'Pretty well' },
      { value: 'little', label: 'A little' },
      { value: 'not', label: 'Not much' }
    ],
    required: true,
    error: 'Please pick one answer.'
  },
  {
    type: 'textarea',
    qid: 'c8-wish',
    section: 'Then and now',
    label: 'Is there something you wish your grown ups understood about being your age?',
    hint: 'Optional — you can write as much or as little as you like.',
    placeholder: 'For example: Everyone in my class…',
    required: false
  },
  {
    type: 'section',
    qid: 's-hopes',
    section: 'Hopes',
    title: 'Hopes',
    intro: 'Last few questions about you and the future.',
    notice: 'There are no right or wrong answers. Your answers are private.'
  },
  {
    type: 'checkbox',
    qid: 'c8-hopes',
    section: 'Hopes',
    label: 'What do you hope for most?',
    hint: 'Pick all that you like.',
    options: [
      { value: 'fun', label: 'Having fun with friends and family' },
      { value: 'happy', label: 'Feeling happy' },
      { value: 'school', label: 'Doing well at school' },
      { value: 'time', label: 'More time with my grown ups' },
      { value: 'brave', label: 'Being brave when things are hard' }
    ],
    required: true,
    error: 'Please pick at least one.'
  },
  {
    type: 'textarea',
    qid: 'c8-final',
    section: 'Hopes',
    label: 'Before you finish, is there anything else you would like to say?',
    hint: 'Optional — please do not write your full name.',
    placeholder: 'Your thoughts…',
    required: false
  }
];

// ---- Branch: Child 11–13 (always anonymous) ----
window.SURVEY_MODEL.child_11_13 = [
  {
    type: 'section',
    qid: 's-home',
    section: 'Talking at home',
    title: 'Talking at home',
    intro: 'These questions are about conversations with your parent or guardian.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c11-frequency',
    section: 'Talking at home',
    label: 'How often do you have a proper talk with your parent or guardian — not just about chores?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few-week', label: 'A few times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c11-topics',
    section: 'Talking at home',
    label: 'Which topic is hardest to bring up with your parent or guardian?',
    options: [
      { value: 'feelings', label: 'Feelings or stress' },
      { value: 'school', label: 'School or grades' },
      { value: 'friends', label: 'Friends or relationships' },
      { value: 'rules', label: 'Rules or screen time' },
      { value: 'future', label: 'The future' },
      { value: 'none', label: 'Nothing is hard to bring up' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c11-listen',
    section: 'Talking at home',
    label: 'When you disagree with a parent or guardian, how heard do you feel?',
    options: [
      { value: 'very', label: 'Very heard' },
      { value: 'somewhat', label: 'Somewhat heard' },
      { value: 'slightly', label: 'Slightly heard' },
      { value: 'not', label: 'Not heard at all' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c11-misunderstood',
    section: 'Talking at home',
    label: 'Describe a recent moment when you and a parent or guardian misunderstood each other.',
    hint: 'Optional — please do not use names.',
    placeholder: 'For example: They thought I meant… but I meant…',
    required: false
  },
  {
    type: 'section',
    qid: 's-devices',
    section: 'Screens and social media',
    title: 'Screens and social media',
    intro: 'A few questions about phones, apps and online time.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c11-mostused',
    section: 'Screens and social media',
    label: 'What do you use most often?',
    options: [
      { value: 'messaging', label: 'Messaging apps' },
      { value: 'social', label: 'Social media' },
      { value: 'video', label: 'Video apps' },
      { value: 'games', label: 'Games' },
      { value: 'school', label: 'School or learning apps' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c11-rules',
    section: 'Screens and social media',
    label: 'How fair are the rules about screen time in your home?',
    options: [
      { value: 'very', label: 'Very fair' },
      { value: 'mostly', label: 'Mostly fair' },
      { value: 'unfair', label: 'A bit unfair' },
      { value: 'none', label: 'There are no rules' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c11-tech',
    section: 'Screens and social media',
    label: 'Does technology mostly bring you and your family closer, or push you apart?',
    options: [
      { value: 'closer', label: 'Brings us closer' },
      { value: 'neither', label: 'Neither' },
      { value: 'apart', label: 'Pushes us apart' },
      { value: 'unsure', label: 'I am not sure' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'section',
    qid: 's-generation',
    section: 'Generational gap',
    title: 'Generational gap',
    intro: 'These questions are about growing up today compared with when your parents or guardians were young.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c11-gap',
    section: 'Generational gap',
    label: 'How large is the gap between your life and your parents’ or guardians’ life at your age?',
    options: [
      { value: 'much', label: 'Much larger' },
      { value: 'somewhat', label: 'Somewhat larger' },
      { value: 'same', label: 'About the same' },
      { value: 'smaller', label: 'Smaller than people think' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c11-understand',
    section: 'Generational gap',
    label: 'How well do your parents or guardians understand the world you are growing up in?',
    options: [
      { value: 'very', label: 'Very well' },
      { value: 'mostly', label: 'Mostly well' },
      { value: 'partly', label: 'Partly' },
      { value: 'not', label: 'Not very well' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c11-wish',
    section: 'Generational gap',
    label: 'Is there something you wish your parents or guardians understood about being your age today?',
    hint: 'Optional — please do not use names.',
    placeholder: 'For example: It feels like…',
    required: false
  },
  {
    type: 'section',
    qid: 's-hopes',
    section: 'Hopes and future',
    title: 'Hopes and future',
    intro: 'The last few questions are about you and what you hope for.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'checkbox',
    qid: 'c11-hopes',
    section: 'Hopes and future',
    label: 'What do you hope for most?',
    hint: 'Select all that apply.',
    options: [
      { value: 'happiness', label: 'Happiness and wellbeing' },
      { value: 'confidence', label: 'Confidence and independence' },
      { value: 'friends', label: 'Good friends' },
      { value: 'success', label: 'Doing well at school' },
      { value: 'balance', label: 'A healthy balance with technology' },
      { value: 'understood', label: 'Feeling understood by grown ups' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'c11-future',
    section: 'Hopes and future',
    label: 'How optimistic are you that communication at home will get easier over the next year?',
    options: [
      { value: 'very', label: 'Very optimistic' },
      { value: 'somewhat', label: 'Somewhat optimistic' },
      { value: 'neutral', label: 'Neither optimistic nor pessimistic' },
      { value: 'pessimistic', label: 'Pessimistic' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c11-final',
    section: 'Hopes and future',
    label: 'Before you finish, is there anything else you would like to share?',
    hint: 'Optional — please do not use your full name.',
    placeholder: 'Your thoughts…',
    required: false
  }
];

// ---- Branch: Child 14–16 (always anonymous) ----
window.SURVEY_MODEL.child_14_16 = [
  {
    type: 'section',
    qid: 's-home',
    section: 'Communication at home',
    title: 'Communication at home',
    intro: 'These questions are about talking with your parent or guardian.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c14-frequency',
    section: 'Communication at home',
    label: 'How often do you have an open conversation with your parent or guardian — one where you can say what you really think?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few-week', label: 'A few times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'checkbox',
    qid: 'c14-barriers',
    section: 'Communication at home',
    label: 'What makes it hardest to talk openly at home?',
    hint: 'Select all that apply.',
    options: [
      { value: 'judged', label: 'Fear of being judged' },
      { value: 'conflict', label: 'It turns into an argument' },
      { value: 'privacy', label: 'I want to keep my privacy' },
      { value: 'busy', label: 'Everyone is busy' },
      { value: 'devices', label: 'We are all on our own devices' },
      { value: 'none', label: 'Nothing really gets in the way' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'c14-listen',
    section: 'Communication at home',
    label: 'When you disagree with a parent or guardian, how heard do you feel?',
    options: [
      { value: 'very', label: 'Very heard' },
      { value: 'somewhat', label: 'Somewhat heard' },
      { value: 'slightly', label: 'Slightly heard' },
      { value: 'not', label: 'Not heard at all' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c14-misunderstood',
    section: 'Communication at home',
    label: 'Describe a recent moment when you and a parent or guardian misunderstood each other.',
    hint: 'Optional — please do not use names.',
    placeholder: 'For example: They assumed I was… but actually…',
    required: false
  },
  {
    type: 'section',
    qid: 's-devices',
    section: 'Digital life',
    title: 'Digital life',
    intro: 'These questions are about your phone, social media and online life.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c14-time',
    section: 'Digital life',
    label: 'How much of your free time do you spend on screens?',
    options: [
      { value: 'lots', label: 'Most of it' },
      { value: 'some', label: 'A fair amount' },
      { value: 'little', label: 'A little' },
      { value: 'none', label: 'Very little' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c14-rules',
    section: 'Digital life',
    label: 'How fair are the rules about your phone or social media?',
    options: [
      { value: 'very', label: 'Very fair' },
      { value: 'mostly', label: 'Mostly fair' },
      { value: 'unfair', label: 'A bit unfair' },
      { value: 'none', label: 'I set my own rules' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c14-tech',
    section: 'Digital life',
    label: 'Does technology mostly bring you and your family closer, or push you apart?',
    options: [
      { value: 'closer', label: 'Brings us closer' },
      { value: 'neither', label: 'Neither' },
      { value: 'apart', label: 'Pushes us apart' },
      { value: 'unsure', label: 'I am not sure' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c14-online',
    section: 'Digital life',
    label: 'What is the biggest challenge of growing up with the internet?',
    hint: 'Optional — a sentence or two is enough.',
    placeholder: 'For example: It is hard to switch off…',
    required: false
  },
  {
    type: 'section',
    qid: 's-generation',
    section: 'Generational gap',
    title: 'Generational gap',
    intro: 'These questions are about how your world compares with your parents’ or guardians’ youth.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c14-gap',
    section: 'Generational gap',
    label: 'How large is the gap between your life and your parents’ or guardians’ life at your age?',
    options: [
      { value: 'much', label: 'Much larger' },
      { value: 'somewhat', label: 'Somewhat larger' },
      { value: 'same', label: 'About the same' },
      { value: 'smaller', label: 'Smaller than people think' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c14-understand',
    section: 'Generational gap',
    label: 'How well do your parents or guardians understand the pressures you face?',
    options: [
      { value: 'very', label: 'Very well' },
      { value: 'mostly', label: 'Mostly well' },
      { value: 'partly', label: 'Partly' },
      { value: 'not', label: 'Not very well' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c14-values',
    section: 'Generational gap',
    label: 'Which statement best describes your view of your generation?',
    options: [
      { value: 'pressure', label: 'It faces pressures older generations did not' },
      { value: 'advantage', label: 'It has advantages older generations did not' },
      { value: 'similar', label: 'It is not so different' },
      { value: 'unsure', label: 'I do not feel able to judge' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c14-wish',
    section: 'Generational gap',
    label: 'Is there something you wish your parents or guardians understood about being your age today?',
    hint: 'Optional — please do not use names.',
    placeholder: 'For example: What people do not get is…',
    required: false
  },
  {
    type: 'section',
    qid: 's-hopes',
    section: 'Hopes and future',
    title: 'Hopes and future',
    intro: 'The last few questions are about what matters to you going forward.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'checkbox',
    qid: 'c14-hopes',
    section: 'Hopes and future',
    label: 'What do you hope for most?',
    hint: 'Select all that apply.',
    options: [
      { value: 'happiness', label: 'Happiness and wellbeing' },
      { value: 'confidence', label: 'Confidence and independence' },
      { value: 'friends', label: 'Good friends and relationships' },
      { value: 'success', label: 'School or career success' },
      { value: 'balance', label: 'A healthy balance with technology' },
      { value: 'understood', label: 'Feeling understood by grown ups' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'textarea',
    qid: 'c14-final',
    section: 'Hopes and future',
    label: 'Before you finish, is there anything else you would like to share?',
    hint: 'Optional — please do not use your full name.',
    placeholder: 'Your thoughts…',
    required: false
  }
];

// ---- Branch: Child 17–18 (always anonymous) ----
window.SURVEY_MODEL.child_17_18 = [
  {
    type: 'section',
    qid: 's-home',
    section: 'Communication at home',
    title: 'Communication at home',
    intro: 'These questions are about conversation with your parent or guardian.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c17-frequency',
    section: 'Communication at home',
    label: 'How often do you have a genuine conversation with your parent or guardian — one where your opinion counts?',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'few-week', label: 'A few times a week' },
      { value: 'weekly', label: 'About once a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c17-topics',
    section: 'Communication at home',
    label: 'Which topic is hardest to discuss with your parent or guardian?',
    options: [
      { value: 'future', label: 'Plans after school or work' },
      { value: 'feelings', label: 'Feelings or mental health' },
      { value: 'rules', label: 'Independence and rules' },
      { value: 'money', label: 'Money' },
      { value: 'relationships', label: 'Relationships' },
      { value: 'none', label: 'Nothing is hard to discuss' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c17-listen',
    section: 'Communication at home',
    label: 'When you disagree with a parent or guardian, how heard do you feel?',
    options: [
      { value: 'very', label: 'Very heard' },
      { value: 'somewhat', label: 'Somewhat heard' },
      { value: 'slightly', label: 'Slightly heard' },
      { value: 'not', label: 'Not heard at all' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c17-autonomy',
    section: 'Communication at home',
    label: 'Where would you like more independence than you currently have?',
    hint: 'Optional — a sentence or two is enough.',
    placeholder: 'For example: Making my own plans at the weekend…',
    required: false
  },
  {
    type: 'section',
    qid: 's-devices',
    section: 'Digital life',
    title: 'Digital life',
    intro: 'These questions are about your phone, social media and online habits.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c17-time',
    section: 'Digital life',
    label: 'How much of your free time do you spend on screens?',
    options: [
      { value: 'lots', label: 'Most of it' },
      { value: 'some', label: 'A fair amount' },
      { value: 'little', label: 'A little' },
      { value: 'none', label: 'Very little' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c17-dependence',
    section: 'Digital life',
    label: 'How would you describe your relationship with your phone?',
    options: [
      { value: 'helpful', label: 'Mostly helpful' },
      { value: 'mixed', label: 'Mixed' },
      { value: 'hard', label: 'Hard to put down' },
      { value: 'optional', label: 'I could easily do without it' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c17-tech',
    section: 'Digital life',
    label: 'Does technology mostly bring you and your family closer, or push you apart?',
    options: [
      { value: 'closer', label: 'Brings us closer' },
      { value: 'neither', label: 'Neither' },
      { value: 'apart', label: 'Pushes us apart' },
      { value: 'unsure', label: 'I am not sure' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'section',
    qid: 's-generation',
    section: 'Generational gap',
    title: 'Generational gap',
    intro: 'These questions are about how your world compares with your parents’ or guardians’ youth.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'radio',
    qid: 'c17-gap',
    section: 'Generational gap',
    label: 'How large is the gap between your life and your parents’ or guardians’ life at your age?',
    options: [
      { value: 'much', label: 'Much larger' },
      { value: 'somewhat', label: 'Somewhat larger' },
      { value: 'same', label: 'About the same' },
      { value: 'smaller', label: 'Smaller than people think' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'radio',
    qid: 'c17-understand',
    section: 'Generational gap',
    label: 'How well do your parents or guardians understand the world you are entering — work, study and adult life?',
    options: [
      { value: 'very', label: 'Very well' },
      { value: 'mostly', label: 'Mostly well' },
      { value: 'partly', label: 'Partly' },
      { value: 'not', label: 'Not very well' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c17-wish',
    section: 'Generational gap',
    label: 'Is there something you wish your parents or guardians understood about being your age today?',
    hint: 'Optional — please do not use names.',
    placeholder: 'For example: What has changed is…',
    required: false
  },
  {
    type: 'section',
    qid: 's-hopes',
    section: 'Hopes and future',
    title: 'Hopes and future',
    intro: 'The last few questions are about where you are heading.',
    notice: 'There are no right or wrong answers. Your answers are anonymous.'
  },
  {
    type: 'checkbox',
    qid: 'c17-hopes',
    section: 'Hopes and future',
    label: 'What do you hope for most in the next few years?',
    hint: 'Select all that apply.',
    options: [
      { value: 'happiness', label: 'Happiness and wellbeing' },
      { value: 'independence', label: 'Independence' },
      { value: 'career', label: 'Study or career progress' },
      { value: 'relationships', label: 'Strong relationships' },
      { value: 'balance', label: 'A healthy balance with technology' },
      { value: 'understood', label: 'Feeling understood by family' }
    ],
    required: true,
    error: 'Please select at least one option.'
  },
  {
    type: 'radio',
    qid: 'c17-future',
    section: 'Hopes and future',
    label: 'How optimistic are you that communication at home will improve as you get older?',
    options: [
      { value: 'very', label: 'Very optimistic' },
      { value: 'somewhat', label: 'Somewhat optimistic' },
      { value: 'neutral', label: 'Neither optimistic nor pessimistic' },
      { value: 'pessimistic', label: 'Pessimistic' }
    ],
    required: true,
    error: 'Please select one option.'
  },
  {
    type: 'textarea',
    qid: 'c17-final',
    section: 'Hopes and future',
    label: 'Before you finish, is there anything else you would like to share about communication across generations?',
    hint: 'Optional — please do not use your full name.',
    placeholder: 'Your thoughts…',
    required: false
  }
];
