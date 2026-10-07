export const WEDDING = {
  couple: {
    person1: 'Evelyn',
    person2: 'Adrian',
    surname1: 'Ashcroft',
    surname2: 'Blackwood',
    joined: 'Evelyn Ashcroft × Adrian Blackwood',
  },
  date: {
    display: '31 October 2026',
    iso: '2026-10-31T16:00:00+00:00',
    parts: { day: '31', month: 'OCTOBER', year: '2026' },
  },
  venue: {
    name: 'The Grand Hall',
    city: 'Edinburgh',
    full: 'The Grand Hall, Edinburgh',
  },
  location: {
    venue: 'The Grand Hall',
    name: 'The Grand Hall',
    city: 'Edinburgh',
    full: 'The Grand Hall, Edinburgh',
  },
  story: [
    {
      date: '14 FEBRUARY 2021',
      title: 'THE FIRST ENCOUNTER',
      description: 'A single glance across a candlelit room changed everything.',
    },
    {
      date: '27 AUGUST 2022',
      title: 'THE FIRST ADVENTURE',
      description: 'Two wanderers, one winding road into the unknown.',
    },
    {
      date: '06 MAY 2024',
      title: 'THE QUESTION',
      description: 'Under a thousand stars, four words rewrote the future.',
    },
    {
      date: '31 OCTOBER 2026',
      title: 'FOREVER BEGINS',
      description: 'The Grand Hall, Edinburgh. Where magic becomes reality.',
    },
  ],
  schedule: [
    { time: '4:00 PM', hour: 16, label: 'Ceremony', description: 'The vows that bind two souls together.', icon: '◆' },
    { time: '6:00 PM', hour: 18, label: 'Celebration', description: 'Raise a glass to the beginning.', icon: '✦' },
    { time: '8:00 PM', hour: 20, label: 'Dinner', description: 'A feast worthy of the occasion.', icon: '◈' },
    { time: '11:00 PM', hour: 23, label: 'Dancing', description: 'Let the night carry you away.', icon: '◉' },
  ],
  rsvp: {
    deadline: '1 September 2026',
    // Paste a form-service URL (e.g. https://formspree.io/f/xxxx) to collect
    // responses online. Left empty, the form opens a pre-filled email instead.
    endpoint: '',
    email: 'rsvp@evelynandadrian.com',
    maxGuests: 4,
  },
  // Guest details & travel: each stop is a point the footsteps reach on the map
  travel: [
    {
      kicker: 'Arriving by air',
      title: 'Edinburgh Airport',
      lines: ['Airlink 100 bus or the tram into the city (about 30 min)', 'Taxis from the rank outside arrivals, about £25'],
    },
    {
      kicker: 'Arriving by train',
      title: 'Edinburgh Waverley',
      lines: ['Direct trains from London King’s Cross (4 hrs 20)', 'A 10-minute walk up to the Royal Mile'],
    },
    {
      kicker: 'Where to stay',
      title: 'Rooms held for our guests',
      lines: ['The Balmoral · Hotel du Vin · Radisson Royal Mile', 'Quote “ASHCROFT-BLACKWOOD” · book by 1 September'],
    },
    {
      kicker: 'On the night',
      title: 'Getting to the Great Hall',
      lines: ['Shuttle from all three hotels at 3:00 PM', 'Carriages home from 11:30 PM · very limited parking'],
    },
  ],
  details: {
    venue: {
      name: 'The Grand Hall',
      address: 'Royal Mile, Edinburgh EH1, Scotland',
      photo: '/photos/venue.jpg',
      photoCredit: { text: 'Osama Shukir Muhammed Amin FRCP(Glasg) · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Interior_of_the_Great_Hall_at_Edinburgh_Castle,_Scotland.jpg' },
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Royal+Mile+Edinburgh',
      notes: [
        'Ceremony & reception under one roof',
        'Arrive by 3:30 PM — doors close at 4:00 PM',
        'Waverley Station is a 10-minute walk',
      ],
    },
    dressCode: {
      title: 'Black Tie, Hogwarts Optional',
      description:
        'Formal evening attire in deep jewel tones. Show your house colours if you wish — a scarf, a tie, a touch of crimson, emerald, sapphire or gold.',
      houses: [
        { name: 'Gryffindor', colors: ['#7f0909', '#d3a625'] },
        { name: 'Slytherin', colors: ['#1a472a', '#aaaaaa'] },
        { name: 'Ravenclaw', colors: ['#0e1a40', '#946b2d'] },
        { name: 'Hufflepuff', colors: ['#ecb939', '#372e29'] },
      ],
    },
    registry: {
      title: 'Our Gringotts Vault',
      description:
        'Your presence is the greatest gift. Should you wish to contribute, a small honeymoon fund and a short registry await in our vault.',
      links: [
        { label: 'Honeymoon Fund', url: '#' },
        { label: 'Gift Registry', url: '#' },
      ],
    },
  },
  invitationText: [
    'YOU ARE INVITED',
    'TO WITNESS',
    'THE BEGINNING',
    'OF FOREVER',
  ],
};
