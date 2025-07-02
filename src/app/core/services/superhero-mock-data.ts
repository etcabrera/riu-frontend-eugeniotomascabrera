import { Superhero } from "../models/superhero.model";

export const MOCK_SUPERHEROES: Superhero[] = [
    {
        id: 1,
        name: 'Spider-Man',
        universe: 'Marvel',
        powers: ['Wall-crawling', 'Super strength', 'Spider-sense'],
        image: 'https://example.com/spiderman.jpg',
        biography: 'Peter Parker got spider powers from a bite. He fights crime in New York.'
    },
    {
        id: 2,
        name: 'Superman',
        universe: 'DC Comics',
        powers: ['Flight', 'Super strength', 'Heat vision'],
        image: 'https://example.com/superman.jpg',
        biography: 'He came from Krypton as a baby. He grew up on Earth and uses his powers to help people.'
    },
    {
        id: 3,
        name: 'Wonder Woman',
        universe: 'DC Comics',
        powers: ['Super strength', 'Flight', 'Combat skills'],
        image: 'https://example.com/wonderwoman.jpg',
        biography: 'Diana is an Amazon princess. She came to the human world to bring peace.'
    },
    {
        id: 4,
        name: 'Batman',
        universe: 'DC Comics',
        powers: ['High intellect', 'Detective skills', 'Martial arts'],
        image: 'https://example.com/batman.jpg',
        biography: 'Bruce Wayne fights crime as Batman after his parents were killed. He uses his mind and gadgets.'
    },
    {
        id: 5,
        name: 'Captain America',
        universe: 'Marvel',
        powers: ['Peak human strength', 'Tactical genius', 'Shield mastery'],
        image: 'https://example.com/captainamerica.jpg',
        biography: 'Steve Rogers became a super-soldier. He leads heroes with his shield and strong will.'
    }
];