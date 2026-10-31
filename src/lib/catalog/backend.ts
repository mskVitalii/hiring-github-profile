import { DOTNET, JS_TS, JVM } from './languages';
import type { TechDef } from './types';

const be = (def: Omit<TechDef, 'category'>): TechDef => ({
  category: 'backend',
  ...def,
});

export const BACKEND: TechDef[] = [
  // JS / TS
  be({
    name: 'Node.js',
    langs: JS_TS,
    topics: ['nodejs', 'node-js', 'node'],
    keywords: ['node.js', 'nodejs'],
    badge: ['339933', 'nodedotjs', 'ffffff'],
  }),
  be({
    name: 'Express',
    langs: JS_TS,
    topics: ['express', 'expressjs', 'express-js'],
    keywords: ['express.js', 'expressjs'],
    deps: { npm: ['express'] },
    implies: ['Node.js'],
    badge: ['000000', 'express', 'ffffff'],
  }),
  be({
    name: 'Fastify',
    langs: JS_TS,
    topics: ['fastify'],
    deps: { npm: ['fastify'] },
    implies: ['Node.js'],
    badge: ['000000', 'fastify', 'ffffff'],
  }),
  be({
    name: 'NestJS',
    langs: JS_TS,
    topics: ['nestjs', 'nest-js'],
    deps: { npm: ['@nestjs/core'] },
    implies: ['Node.js'],
    badge: ['E0234E', 'nestjs', 'ffffff'],
  }),
  be({
    name: 'Koa',
    langs: JS_TS,
    topics: ['koa', 'koajs'],
    deps: { npm: ['koa'] },
    implies: ['Node.js'],
    badge: ['33333D', 'koa', 'ffffff'],
  }),
  be({
    name: 'Hono',
    langs: JS_TS,
    topics: ['hono'],
    deps: { npm: ['hono'] },
    badge: ['E36002', 'hono', 'ffffff'],
  }),
  be({
    name: 'Deno',
    langs: JS_TS,
    topics: ['deno'],
    files: [/(^|\/)deno\.jsonc?$/],
    badge: ['000000', 'deno', 'ffffff'],
  }),
  // Python
  be({
    name: 'Django',
    langs: ['Python'],
    topics: ['django', 'django-rest-framework'],
    deps: { pypi: ['django', 'djangorestframework'] },
    badge: ['092E20', 'django', 'ffffff'],
  }),
  be({
    name: 'Flask',
    langs: ['Python'],
    topics: ['flask'],
    deps: { pypi: ['flask'] },
    badge: ['000000', 'flask', 'ffffff'],
  }),
  be({
    name: 'FastAPI',
    langs: ['Python'],
    topics: ['fastapi', 'fast-api'],
    deps: { pypi: ['fastapi'] },
    badge: ['009688', 'fastapi', 'ffffff'],
  }),
  be({
    name: 'Celery',
    langs: ['Python'],
    topics: ['celery'],
    deps: { pypi: ['celery'] },
    badge: ['37814A', 'celery', 'ffffff'],
  }),

  // Go
  be({
    name: 'Gin',
    langs: ['Go'],
    topics: ['gin', 'gin-gonic'],
    deps: { go: ['github.com/gin-gonic/gin'] },
    badge: ['00ADD8', 'go', 'ffffff'],
  }),
  be({
    name: 'Fiber',
    langs: ['Go'],
    topics: ['gofiber', 'fiber'],
    deps: { go: ['github.com/gofiber/fiber*'] },
    badge: ['00ADD8', 'go', 'ffffff'],
  }),
  be({
    name: 'Echo',
    langs: ['Go'],
    topics: ['labstack-echo'],
    deps: { go: ['github.com/labstack/echo*'] },
    badge: ['00ADD8', 'go', 'ffffff'],
  }),
  be({
    name: 'Chi',
    langs: ['Go'],
    deps: { go: ['github.com/go-chi/chi*'] },
    badge: ['00ADD8', 'go', 'ffffff'],
  }),

  // Rust
  be({
    name: 'Actix',
    langs: ['Rust'],
    topics: ['actix', 'actix-web'],
    deps: { cargo: ['actix-web'] },
    badge: ['CE422B', 'rust', 'ffffff'],
  }),
  be({
    name: 'Axum',
    langs: ['Rust'],
    topics: ['axum'],
    deps: { cargo: ['axum'] },
    badge: ['CE422B', 'rust', 'ffffff'],
  }),
  be({
    name: 'Tokio',
    langs: ['Rust'],
    topics: ['tokio'],
    deps: { cargo: ['tokio'] },
    badge: ['CE422B', 'rust', 'ffffff'],
  }),

  // JVM
  be({
    name: 'Spring Boot',
    langs: JVM,
    topics: ['spring-boot', 'springboot', 'spring'],
    keywords: ['spring boot'],
    deps: { maven: ['spring-boot*', 'org.springframework.boot*'] },
    badge: ['6DB33F', 'springboot', 'ffffff'],
  }),
  be({
    name: 'Ktor',
    langs: ['Kotlin'],
    topics: ['ktor'],
    deps: { maven: ['io.ktor*', 'ktor-*'] },
    badge: ['087CFA', 'ktor', 'ffffff'],
  }),

  // .NET
  be({
    name: 'ASP.NET Core',
    langs: DOTNET,
    topics: ['aspnetcore', 'asp-net-core', 'aspnet', 'asp-net', 'asp-net-mvc'],
    keywords: ['asp.net'],
    deps: { nuget: ['Microsoft.AspNetCore*', 'Microsoft.NET.Sdk.Web'] },
    badge: ['512BD4', 'dotnet', 'ffffff'],
  }),

  // Ruby / PHP / Elixir
  be({
    name: 'Ruby on Rails',
    langs: ['Ruby'],
    topics: ['rails', 'ruby-on-rails'],
    keywords: ['ruby on rails'],
    deps: { gem: ['rails'] },
    badge: ['CC0000', 'rubyonrails', 'ffffff'],
  }),
  be({
    name: 'Sinatra',
    langs: ['Ruby'],
    topics: ['sinatra'],
    deps: { gem: ['sinatra'] },
    badge: ['000000', 'rubysinatra', 'ffffff'],
  }),
  be({
    name: 'Laravel',
    langs: ['PHP'],
    topics: ['laravel'],
    deps: { composer: ['laravel/framework'] },
    badge: ['FF2D20', 'laravel', 'ffffff'],
  }),
  be({
    name: 'Symfony',
    langs: ['PHP'],
    topics: ['symfony'],
    deps: { composer: ['symfony/framework-bundle', 'symfony/http-kernel'] },
    badge: ['000000', 'symfony', 'ffffff'],
  }),
  be({
    name: 'Phoenix',
    langs: ['Elixir'],
    topics: ['phoenix', 'phoenix-framework'],
    deps: { hex: ['phoenix'] },
    badge: ['FD4F00', 'phoenixframework', 'ffffff'],
  }),
];
