export interface GalleryProfile {
  login: string;
  name: string;
  tagline: string;
  youtube?: { url: string; subscribers: string };
  /** Extra link shown on the card (e.g. the author's LinkedIn) */
  link?: { url: string; label: string };
}

export interface GalleryGroup {
  title: string;
  profiles: GalleryProfile[];
}

/** Curated public profiles to explore. Personal accounts only — no orgs. */
export const GALLERY: GalleryGroup[] = [
  {
    title: 'Made by',
    profiles: [
      {
        login: 'mskVitalii',
        name: 'Vitalii Popov',
        tagline: 'Author of this tool',
        link: { url: 'https://www.linkedin.com/in/mskvitalii/', label: 'LinkedIn' },
      },
    ],
  },
  {
    title: 'Legends',
    profiles: [
      { login: 'torvalds', name: 'Linus Torvalds', tagline: 'Creator of Linux and Git' },
      { login: 'gvanrossum', name: 'Guido van Rossum', tagline: 'Creator of Python' },
      { login: 'matz', name: 'Yukihiro Matsumoto', tagline: 'Creator of Ruby' },
      { login: 'josevalim', name: 'José Valim', tagline: 'Creator of Elixir' },
      { login: 'ry', name: 'Ryan Dahl', tagline: 'Creator of Node.js and Deno' },
      { login: 'lattner', name: 'Chris Lattner', tagline: 'LLVM, Swift, Mojo' },
      { login: 'andrewrk', name: 'Andrew Kelley', tagline: 'Creator of Zig' },
      { login: 'antirez', name: 'Salvatore Sanfilippo', tagline: 'Creator of Redis' },
      { login: 'dhh', name: 'David Heinemeier Hansson', tagline: 'Creator of Ruby on Rails' },
      { login: 'jeresig', name: 'John Resig', tagline: 'Creator of jQuery' },
      { login: 'mitchellh', name: 'Mitchell Hashimoto', tagline: 'HashiCorp co-founder, Ghostty' },
      { login: 'mojombo', name: 'Tom Preston-Werner', tagline: 'GitHub co-founder, Jekyll' },
      { login: 'defunkt', name: 'Chris Wanstrath', tagline: 'GitHub co-founder' },
      { login: 'tj', name: 'TJ Holowaychuk', tagline: 'Express, Koa, Commander' },
      { login: 'geohot', name: 'George Hotz', tagline: 'tinygrad, comma.ai' },
    ],
  },
  {
    title: 'Framework & open-source authors',
    profiles: [
      { login: 'gaearon', name: 'Dan Abramov', tagline: 'Redux, React core' },
      { login: 'sebmarkbage', name: 'Sebastian Markbåge', tagline: 'React core' },
      { login: 'acdlite', name: 'Andrew Clark', tagline: 'React core' },
      { login: 'yyx990803', name: 'Evan You', tagline: 'Creator of Vue and Vite' },
      { login: 'Rich-Harris', name: 'Rich Harris', tagline: 'Creator of Svelte' },
      { login: 'ryansolid', name: 'Ryan Carniato', tagline: 'Creator of SolidJS' },
      { login: 'developit', name: 'Jason Miller', tagline: 'Creator of Preact' },
      { login: 'rauchg', name: 'Guillermo Rauch', tagline: 'Vercel, Next.js, Socket.IO' },
      { login: 'evanw', name: 'Evan Wallace', tagline: 'esbuild, Figma co-founder' },
      { login: 'Jarred-Sumner', name: 'Jarred Sumner', tagline: 'Creator of Bun' },
      { login: 'antfu', name: 'Anthony Fu', tagline: 'Vitest, UnoCSS, Slidev' },
      { login: 'pi0', name: 'Pooya Parsa', tagline: 'Nitro, UnJS' },
      { login: 'danielroe', name: 'Daniel Roe', tagline: 'Nuxt lead' },
      { login: 'tannerlinsley', name: 'Tanner Linsley', tagline: 'TanStack' },
      { login: 'shadcn', name: 'shadcn', tagline: 'shadcn/ui' },
      { login: 'isaacs', name: 'Isaac Z. Schlueter', tagline: 'Creator of npm' },
      { login: 'sindresorhus', name: 'Sindre Sorhus', tagline: '1000+ npm packages' },
      { login: 'tiangolo', name: 'Sebastián Ramírez', tagline: 'Creator of FastAPI' },
      { login: 'charliermarsh', name: 'Charlie Marsh', tagline: 'Ruff, uv' },
      { login: 'mitsuhiko', name: 'Armin Ronacher', tagline: 'Flask, Jinja, Rye' },
      { login: 'kennethreitz', name: 'Kenneth Reitz', tagline: 'Requests' },
      { login: 'simonw', name: 'Simon Willison', tagline: 'Datasette, Django co-creator' },
      { login: 'BurntSushi', name: 'Andrew Gallant', tagline: 'ripgrep, Rust regex' },
      { login: 'dtolnay', name: 'David Tolnay', tagline: 'serde, syn, anyhow' },
      { login: 'steveklabnik', name: 'Steve Klabnik', tagline: 'The Rust Book' },
      { login: 'fabpot', name: 'Fabien Potencier', tagline: 'Creator of Symfony' },
      { login: 'JakeWharton', name: 'Jake Wharton', tagline: 'Android open source' },
      { login: 'mrdoob', name: 'Ricardo Cabello', tagline: 'Creator of three.js' },
      { login: 'addyosmani', name: 'Addy Osmani', tagline: 'Chrome, web performance' },
      { login: 'paulirish', name: 'Paul Irish', tagline: 'Chrome DevTools' },
      { login: 'jakearchibald', name: 'Jake Archibald', tagline: 'Service workers, Squoosh' },
      { login: 'trekhleb', name: 'Oleksii Trekhleb', tagline: 'javascript-algorithms' },
    ],
  },
  {
    title: 'AI & data',
    profiles: [
      { login: 'karpathy', name: 'Andrej Karpathy', tagline: 'nanoGPT, llm.c', youtube: { url: 'https://www.youtube.com/@AndrejKarpathy', subscribers: '1.75M' } },
      { login: 'ggerganov', name: 'Georgi Gerganov', tagline: 'llama.cpp, whisper.cpp' },
      { login: 'fchollet', name: 'François Chollet', tagline: 'Creator of Keras' },
      { login: 'soumith', name: 'Soumith Chintala', tagline: 'PyTorch co-creator' },
      { login: 'lucidrains', name: 'Phil Wang', tagline: 'AI paper implementations' },
      { login: 'hadley', name: 'Hadley Wickham', tagline: 'tidyverse, ggplot2' },
    ],
  },
  // Subscriber counts as shown on the channels on 2026-11-02
  {
    title: 'YouTubers & educators',
    profiles: [
      { login: 'codediodeio', name: 'Jeff Delaney', tagline: 'Fireship', youtube: { url: 'https://www.youtube.com/@Fireship', subscribers: '4.32M' } },
      { login: 'bradtraversy', name: 'Brad Traversy', tagline: 'Traversy Media', youtube: { url: 'https://www.youtube.com/@TraversyMedia', subscribers: '2.42M' } },
      { login: 'techwithtim', name: 'Tim Ruscica', tagline: 'Tech With Tim', youtube: { url: 'https://www.youtube.com/@TechWithTim', subscribers: '2.11M' } },
      { login: 'akshaymarch7', name: 'Akshay Saini', tagline: 'Namaste JavaScript', youtube: { url: 'https://www.youtube.com/@akshaymarch7', subscribers: '2.08M' } },
      { login: 'WebDevSimplified', name: 'Kyle Cook', tagline: 'Web Dev Simplified', youtube: { url: 'https://www.youtube.com/@WebDevSimplified', subscribers: '1.78M' } },
      { login: 'CoreyMSchafer', name: 'Corey Schafer', tagline: 'Python tutorials', youtube: { url: 'https://www.youtube.com/@coreyms', subscribers: '1.56M' } },
      { login: 'adrianhajdin', name: 'Adrian Hajdin', tagline: 'JavaScript Mastery', youtube: { url: 'https://www.youtube.com/@javascriptmastery', subscribers: '1.28M' } },
      { login: 'ThePrimeagen', name: 'ThePrimeagen', tagline: 'Streams, Vim, performance', youtube: { url: 'https://www.youtube.com/@ThePrimeTimeagen', subscribers: '1.17M' } },
      { login: 'hiteshchoudhary', name: 'Hitesh Choudhary', tagline: 'Chai aur Code', youtube: { url: 'https://www.youtube.com/@HiteshCodeLab', subscribers: '1.04M' } },
      { login: 'hkirat', name: 'Harkirat Singh', tagline: 'Full-stack cohorts', youtube: { url: 'https://www.youtube.com/@harkirat1', subscribers: '620K' } },
      { login: 't3dotgg', name: 'Theo Browne', tagline: 't3.gg, create-t3-app', youtube: { url: 'https://www.youtube.com/@t3dotgg', subscribers: '576K' } },
      { login: 'SonnySangha', name: 'Sonny Sangha', tagline: 'Papa React', youtube: { url: 'https://www.youtube.com/@SonnySangha', subscribers: '498K' } },
      { login: 'benawad', name: 'Ben Awad', tagline: 'Full-stack videos', youtube: { url: 'https://www.youtube.com/@bawad', subscribers: '491K' } },
      { login: 'mattpocock', name: 'Matt Pocock', tagline: 'Total TypeScript', youtube: { url: 'https://www.youtube.com/@mattpocockuk', subscribers: '429K' } },
      { login: 'piyushgarg-dev', name: 'Piyush Garg', tagline: 'Backend & system design', youtube: { url: 'https://www.youtube.com/@piyushgargdev', subscribers: '427K' } },
      { login: 'rexim', name: 'Alexey Kutepov', tagline: 'Tsoding streams', youtube: { url: 'https://www.youtube.com/@TsodingDaily', subscribers: '222K' } },
      { login: 'wesbos', name: 'Wes Bos', tagline: 'Syntax.fm, JS courses', youtube: { url: 'https://www.youtube.com/@WesBos', subscribers: '220K' } },
      { login: 'jherr', name: 'Jack Herrington', tagline: 'Blue Collar Coder', youtube: { url: 'https://www.youtube.com/@jherr', subscribers: '210K' } },
      { login: 'tjdevries', name: 'TJ DeVries', tagline: 'Neovim core', youtube: { url: 'https://www.youtube.com/@teej_dv', subscribers: '119K' } },
      { login: 'jonhoo', name: 'Jon Gjengset', tagline: 'Crust of Rust', youtube: { url: 'https://www.youtube.com/@jonhoo', subscribers: '111K' } },
      { login: 'kentcdodds', name: 'Kent C. Dodds', tagline: 'Testing Library, Epic Web', youtube: { url: 'https://www.youtube.com/@kentcdodds-vids', subscribers: '60K' } },
    ],
  },
  {
    title: 'Russian-speaking creators',
    profiles: [
      { login: 'vladilenm', name: 'Vladilen Minin', tagline: 'JavaScript & frontend courses', youtube: { url: 'https://www.youtube.com/@VladilenMinin', subscribers: '311K' } },
      { login: 'Archakov06', name: 'Dennis Archakov', tagline: 'Archakov Blog', youtube: { url: 'https://www.youtube.com/@ArchakovBlog', subscribers: '75.7K' } },
    ],
  },
];

export function galleryAvatar(login: string, size = 96): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=${size}`;
}

const GALLERY_LOGINS = new Set(
  GALLERY.flatMap((g) => g.profiles.map((p) => p.login.toLowerCase())),
);

export function isGalleryLogin(login: string): boolean {
  return GALLERY_LOGINS.has(login.trim().toLowerCase());
}

export function findGalleryProfile(login: string): GalleryProfile | undefined {
  const key = login.trim().toLowerCase();
  return GALLERY.flatMap((g) => g.profiles).find(
    (p) => p.login.toLowerCase() === key,
  );
}
