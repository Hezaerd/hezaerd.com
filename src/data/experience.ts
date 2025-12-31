export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export const EXPERIENCE = [
  {
    title: 'Full stack & game developer',
    company: 'Hectiq',
    period: '2024 (4 months)',
    description:
      'Prototyping and development in autonomous mode of both a Twitch extension and integration for a Unity game.',
  },
  {
    title: 'Game developer',
    company: 'Vagabond',
    period: '2022 (2 months)',
    description: 'Development of a VR serious game to talk about poverty.',
  },
] as const satisfies Array<Experience>;
