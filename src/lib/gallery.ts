export interface GalleryProfile {
  login: string;
  name: string;
  tagline: string;
}

export interface GalleryGroup {
  title: string;
  profiles: GalleryProfile[];
}

/** Curated public profiles to explore. Personal accounts only — no orgs. */
export const GALLERY: GalleryGroup[] = [
  {
    title: 'Legends',
    profiles: [
      { login: 'torvalds', name: 'Linus Torvalds', tagline: 'Creator of Linux and Git' },
      { login: 'gvanrossum', name: 'Guido van Rossum', tagline: 'Creator of Python' },
      { login: 'antirez', name: 'Salvatore Sanfilippo', tagline: 'Creator of Redis' },
      { login: 'dhh', name: 'David Heinemeier Hansson', tagline: 'Creator of Ruby on Rails' },
      { login: 'mitchellh', name: 'Mitchell Hashimoto', tagline: 'HashiCorp co-founder, Ghostty' },
      { login: 'karpathy', name: 'Andrej Karpathy', tagline: 'nanoGPT, llm.c' },
      { login: 'geohot', name: 'George Hotz', tagline: 'tinygrad, comma.ai' },
      { login: 'tj', name: 'TJ Holowaychuk', tagline: 'Express, Koa, Commander' },
    ],
  },
  {
    title: 'Framework & open-source authors',
    profiles: [
      { login: 'gaearon', name: 'Dan Abramov', tagline: 'Redux, React core' },
      { login: 'yyx990803', name: 'Evan You', tagline: 'Creator of Vue and Vite' },
      { login: 'rauchg', name: 'Guillermo Rauch', tagline: 'Vercel, Next.js, Socket.IO' },
      { login: 'mrdoob', name: 'Ricardo Cabello', tagline: 'Creator of three.js' },
      { login: 'sindresorhus', name: 'Sindre Sorhus', tagline: '1000+ npm packages' },
      { login: 'mitsuhiko', name: 'Armin Ronacher', tagline: 'Flask, Jinja, Rye' },
      { login: 'BurntSushi', name: 'Andrew Gallant', tagline: 'ripgrep, Rust regex' },
      { login: 'fabpot', name: 'Fabien Potencier', tagline: 'Creator of Symfony' },
      { login: 'JakeWharton', name: 'Jake Wharton', tagline: 'Android open source' },
      { login: 'shadcn', name: 'shadcn', tagline: 'shadcn/ui' },
      { login: 'addyosmani', name: 'Addy Osmani', tagline: 'Chrome, web performance' },
      { login: 'trekhleb', name: 'Oleksii Trekhleb', tagline: 'javascript-algorithms' },
    ],
  },
  {
    title: 'YouTubers & educators',
    profiles: [
      { login: 'ThePrimeagen', name: 'ThePrimeagen', tagline: 'Streams, Vim, performance' },
      { login: 't3dotgg', name: 'Theo Browne', tagline: 't3.gg, create-t3-app' },
      { login: 'codediodeio', name: 'Jeff Delaney', tagline: 'Fireship' },
      { login: 'bradtraversy', name: 'Brad Traversy', tagline: 'Traversy Media' },
      { login: 'wesbos', name: 'Wes Bos', tagline: 'Syntax.fm, JS courses' },
      { login: 'kentcdodds', name: 'Kent C. Dodds', tagline: 'Testing Library, Epic Web' },
      { login: 'mattpocock', name: 'Matt Pocock', tagline: 'Total TypeScript' },
      { login: 'adrianhajdin', name: 'Adrian Hajdin', tagline: 'JavaScript Mastery' },
      { login: 'WebDevSimplified', name: 'Kyle Cook', tagline: 'Web Dev Simplified' },
      { login: 'benawad', name: 'Ben Awad', tagline: 'Full-stack videos' },
      { login: 'jonhoo', name: 'Jon Gjengset', tagline: 'Crust of Rust' },
      { login: 'rexim', name: 'Alexey Kutepov', tagline: 'Tsoding streams' },
      { login: 'hiteshchoudhary', name: 'Hitesh Choudhary', tagline: 'Chai aur Code' },
    ],
  },
];

export function galleryAvatar(login: string, size = 96): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=${size}`;
}
