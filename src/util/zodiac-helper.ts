export function getHoroscopeSign(day: number, month: number): string | null {
  const zodiacSigns = [
    {
      sign: 'Capricorn',
      startDate: new Date(0, 11, 22),
      endDate: new Date(0, 0, 19),
    },
    {
      sign: 'Aquarius',
      startDate: new Date(0, 0, 20),
      endDate: new Date(0, 1, 18),
    },
    {
      sign: 'Pisces',
      startDate: new Date(0, 1, 19),
      endDate: new Date(0, 2, 20),
    },
    {
      sign: 'Aries',
      startDate: new Date(0, 2, 21),
      endDate: new Date(0, 3, 19),
    },
    {
      sign: 'Taurus',
      startDate: new Date(0, 3, 20),
      endDate: new Date(0, 4, 20),
    },
    {
      sign: 'Gemini',
      startDate: new Date(0, 4, 21),
      endDate: new Date(0, 5, 20),
    },
    {
      sign: 'Cancer',
      startDate: new Date(0, 5, 21),
      endDate: new Date(0, 6, 22),
    },
    { sign: 'Leo', startDate: new Date(0, 6, 23), endDate: new Date(0, 7, 22) },
    {
      sign: 'Virgo',
      startDate: new Date(0, 7, 23),
      endDate: new Date(0, 8, 22),
    },
    {
      sign: 'Libra',
      startDate: new Date(0, 8, 23),
      endDate: new Date(0, 9, 22),
    },
    {
      sign: 'Scorpio',
      startDate: new Date(0, 9, 23),
      endDate: new Date(0, 10, 21),
    },
    {
      sign: 'Sagittarius',
      startDate: new Date(0, 10, 22),
      endDate: new Date(0, 11, 21),
    },
    {
      sign: 'Capricorn',
      startDate: new Date(0, 11, 22),
      endDate: new Date(0, 11, 31),
    },
  ];

  const birthDate = new Date(0, month - 1, day);

  for (const zodiac of zodiacSigns) {
    if (birthDate >= zodiac.startDate && birthDate <= zodiac.endDate) {
      return zodiac.sign;
    }
  }
  return null;
}

export function getZodiac(year: number): string {
  const zodiacAnimals = [
    'Rat',
    'Ox',
    'Tiger',
    'Rabbit',
    'Dragon',
    'Snake',
    'Horse',
    'Goat',
    'Monkey',
    'Rooster',
    'Dog',
    'Pig',
  ];
  const startYear = 1900;
  const index = (year - startYear) % 12;
  return zodiacAnimals[index];
}

export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
