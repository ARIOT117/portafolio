import type { Dict } from './es'

export const en: Dict = {
  meta: {
    title: 'Diego Esparza (ARIOT117) · Full-stack developer',
    description:
      'Portfolio of Diego Esparza, a full-stack developer in Chihuahua, Mexico. Databases and AI integration.',
  },
  nav: {
    brand: 'ARIOT117',
    projects: 'Projects',
    contact: 'Contact',
    language: 'Language',
    langEs: 'ES',
    langEn: 'EN',
    langEsLabel: 'Español',
    langEnLabel: 'English',
    home: 'Go to top',
  },
  intro: {
    skip: 'Skip',
    skipLabel: 'Skip the intro animation',
  },
  hero: {
    greeting: "Hi, I'm",
    name: 'Diego Esparza',
    role: 'Full-stack developer focused on databases and AI integration.',
    about: 'Software development student. Open to full-time roles and freelance projects.',
    location: 'Chihuahua, Mexico',
    ctaProjects: 'See projects',
    ctaContact: 'Contact',
  },
  projects: {
    title: 'Projects',
    intro: "A selection of things I've built, from games to APIs.",
    open: 'Open',
    close: 'Close',
    back: 'Back',
    backLabel: 'Back to projects',
    role: 'My role',
    stack: 'Stack',
    highlights: 'The essentials',
    team: 'Team',
    viewSite: 'View site',
    viewRepo: 'View repository',
    play: 'Play',
    showcase: 'Showcase',
    publication: 'Post',
    privateRepo: 'Private repository',
    notFound: "I couldn't find that project.",
    externalLink: 'Opens in a new tab',
  },
  contact: {
    title: "Let's talk",
    leadLinkedin: 'Looking for full-time roles and freelance projects. Reach me on LinkedIn.',
    leadEmail: 'Looking for full-time roles and freelance projects. Write to me.',
    copyEmail: 'Copy email',
    copied: 'Email copied',
    sendEmail: 'Send an email',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: {
    copyright: '© 2026 Diego Esparza · ARIOT117',
    built: 'Built with React, TypeScript and Motion',
  },
  eclipseRojo: {
    name: 'Operation Red Eclipse',
    kicker: 'A Mars mission design game, built in Unity',
    summary:
      'A single-player game built in Unity for the NASA Space Apps Challenge 2026, Space Mission Design Game challenge, with team DualDynamics. You design a mission to Mars, fly the spacecraft and scan the planet for a thermal anomaly during a dust storm. It plays in the browser.',
    role: ['Game mechanics', 'Design', 'Interface'],
    highlights: [
      'You design the mission: orbit, launcher and instruments, within limits on mass, power, cost and slots.',
      'You operate the spacecraft and scan Mars during a dust storm.',
      'At the end you get a mission report. It runs in the browser with WebGL.',
    ],
    award: '1st place, local event · NASA Space Apps 2026',
    awardSub: 'Now competing globally',
  },
  gymZong: {
    name: 'Gym Zong',
    kicker: 'An offline Android app for strength routines',
    summary:
      'You open the app, know what is on today, log your workout and see your progress. It is in Spanish and works offline with SQLite. It has streaks with freezes, stats, a calendar and a history. It has its own identity: a flower, warm white and mint.',
    role: ['Product', 'Design', 'Development'],
    credits:
      'My project end to end. Ideas, QA and design proposals: Irvin Chavez and Diego Soto.',
    highlights: [
      'Works offline: your data lives on the phone in SQLite.',
      'Streaks with freezes, stats, calendar and history.',
      'Built with Expo, React Native and TypeScript.',
    ],
  },
  apigym: {
    name: 'ApiGym',
    kicker: 'An API of 1,257 exercises with SVG animations',
    summary:
      'An exercise API in Spanish with 1,257 entries, each with SVG animations. It supports filters and metadata such as difficulty, mechanic, force and equipment. It is a project by team 5-5DE.',
    role: [
      'Wrote the instructions on how to build it',
      'Generated the animated SVGs',
      'Wrote the exercise information',
    ],
    highlights: [
      '1,257 exercises, all with an SVG animation.',
      'Information in Spanish, with filters.',
      'Metadata for difficulty, mechanic, force and equipment.',
    ],
  },
  catstore: {
    name: 'CATSTORE · Snacks and Cats',
    kicker: 'A cat cafe website in Chihuahua',
    summary:
      'A PHP website for a cat cafe in Chihuahua. It has a menu, a location page and a demo shop with accounts, a persistent cart and orders. Each account can upload a private profile photo. It is live on Vercel.',
    role: ['Full-stack development', 'Database'],
    highlights: [
      'Menu, location and a demo shop.',
      'Accounts, persistent cart and orders.',
      'Private profile photo. PHP and MySQL, live on Vercel.',
    ],
  },
}
