import { DOTNET, JS_TS } from './languages';
import type { TechDef } from './types';

const db = (def: Omit<TechDef, 'category'>): TechDef => ({
  category: 'databases',
  ...def,
});

/** Databases, ORMs and data platforms — language-agnostic unless noted */
export const DATABASES: TechDef[] = [
  db({
    name: 'PostgreSQL',
    topics: ['postgresql', 'postgres', 'psql', 'pgvector'],
    keywords: ['postgresql', 'postgres'],
    deps: {
      npm: ['pg', 'postgres', '@neondatabase/serverless'],
      pypi: ['psycopg*', 'asyncpg', 'pgvector'],
      go: ['github.com/jackc/pgx*', 'github.com/lib/pq'],
      cargo: ['tokio-postgres', 'postgres'],
      gem: ['pg'],
      maven: ['postgresql'],
      nuget: ['Npgsql*'],
    },
    compose: /\b(postgres|postgresql|timescaledb|pgvector)\b/,
    badge: ['4169E1', 'postgresql', 'ffffff'],
  }),
  db({
    name: 'MySQL',
    topics: ['mysql', 'mariadb'],
    keywords: ['mysql', 'mariadb'],
    deps: {
      npm: ['mysql', 'mysql2'],
      pypi: ['mysqlclient', 'pymysql', 'aiomysql'],
      go: ['github.com/go-sql-driver/mysql'],
      maven: ['mysql-connector*'],
      nuget: ['MySql.Data', 'Pomelo.EntityFrameworkCore.MySql'],
    },
    compose: /\b(mysql|mariadb|percona)\b/,
    badge: ['4479A1', 'mysql', 'ffffff'],
  }),
  db({
    name: 'MongoDB',
    topics: ['mongodb', 'mongo', 'mongoose'],
    keywords: ['mongodb'],
    deps: {
      npm: ['mongodb', 'mongoose'],
      pypi: ['pymongo', 'motor', 'beanie'],
      go: ['go.mongodb.org/mongo-driver*'],
      nuget: ['MongoDB.Driver'],
    },
    compose: /\bmongo(db)?\b/,
    badge: ['47A248', 'mongodb', 'ffffff'],
  }),
  db({
    name: 'Redis',
    topics: ['redis', 'valkey'],
    keywords: ['redis'],
    deps: {
      npm: ['redis', 'ioredis', '@upstash/redis'],
      pypi: ['redis', 'aioredis'],
      go: ['github.com/redis/go-redis*', 'github.com/go-redis/redis*'],
      cargo: ['redis'],
      gem: ['redis'],
      nuget: ['StackExchange.Redis'],
    },
    compose: /\b(redis|valkey)\b/,
    badge: ['FF4438', 'redis', 'ffffff'],
  }),
  db({
    name: 'SQLite',
    topics: ['sqlite', 'sqlite3'],
    deps: {
      npm: ['sqlite3', 'better-sqlite3'],
      pypi: ['aiosqlite'],
      go: ['github.com/mattn/go-sqlite3', 'modernc.org/sqlite'],
      cargo: ['rusqlite'],
      gem: ['sqlite3'],
    },
    badge: ['003B57', 'sqlite', 'ffffff'],
  }),
  db({
    name: 'Elasticsearch',
    topics: ['elasticsearch', 'opensearch', 'elk'],
    keywords: ['elasticsearch', 'opensearch'],
    deps: {
      npm: ['@elastic/elasticsearch', '@opensearch-project/opensearch'],
      pypi: ['elasticsearch', 'opensearch-py'],
      go: ['github.com/elastic/go-elasticsearch*', 'github.com/olivere/elastic*'],
    },
    compose: /\b(elasticsearch|opensearch)\b/,
    badge: ['005571', 'elasticsearch', 'ffffff'],
  }),
  db({
    name: 'ClickHouse',
    topics: ['clickhouse'],
    deps: {
      npm: ['@clickhouse/client'],
      pypi: ['clickhouse-connect', 'clickhouse-driver'],
      go: ['github.com/ClickHouse/clickhouse-go*'],
    },
    compose: /\bclickhouse\b/,
    badge: ['FFCC01', 'clickhouse', '000000'],
  }),
  db({
    name: 'Cassandra',
    topics: ['cassandra', 'scylladb'],
    deps: { pypi: ['cassandra-driver'], go: ['github.com/gocql/gocql'] },
    compose: /\b(cassandra|scylla)\b/,
    badge: ['1287B1', 'apachecassandra', 'ffffff'],
  }),
  db({
    name: 'DynamoDB',
    topics: ['dynamodb'],
    deps: { npm: ['@aws-sdk/client-dynamodb'] },
    badge: ['4053D6', 'amazondynamodb', 'ffffff'],
  }),
  db({
    name: 'Qdrant',
    topics: ['qdrant'],
    deps: {
      npm: ['@qdrant/js-client-rest'],
      pypi: ['qdrant-client'],
      go: ['github.com/qdrant/go-client'],
    },
    compose: /\bqdrant\b/,
    badge: ['DC244C', 'qdrant', 'ffffff'],
  }),
  db({
    name: 'Firebase',
    topics: ['firebase', 'firestore', 'firebase-extensions'],
    deps: {
      npm: ['firebase', 'firebase-admin', 'firebase-functions'],
      pypi: ['firebase-admin'],
    },
    files: [/(^|\/)firebase\.json$/],
    badge: ['FFCA28', 'firebase', '000000'],
  }),
  db({
    name: 'Supabase',
    topics: ['supabase'],
    deps: { npm: ['@supabase/supabase-js'], pypi: ['supabase'] },
    badge: ['3ECF8E', 'supabase', 'ffffff'],
  }),
  // ORMs are tied to their ecosystem
  db({
    name: 'Prisma',
    langs: JS_TS,
    topics: ['prisma'],
    deps: { npm: ['prisma', '@prisma/client'] },
    files: [/(^|\/)schema\.prisma$/],
    badge: ['2D3748', 'prisma', 'ffffff'],
  }),
  db({
    name: 'Drizzle',
    langs: JS_TS,
    topics: ['drizzle', 'drizzle-orm'],
    deps: { npm: ['drizzle-orm'] },
    badge: ['C5F74F', 'drizzle', '000000'],
  }),
  db({
    name: 'TypeORM',
    langs: JS_TS,
    topics: ['typeorm'],
    deps: { npm: ['typeorm', '@nestjs/typeorm'] },
    badge: ['FE0803', 'typeorm', 'ffffff'],
  }),
  db({
    name: 'SQLAlchemy',
    langs: ['Python'],
    topics: ['sqlalchemy'],
    deps: { pypi: ['sqlalchemy', 'sqlmodel'] },
    badge: ['D71F00', 'sqlalchemy', 'ffffff'],
  }),
  db({
    name: 'Tortoise ORM',
    langs: ['Python'],
    deps: { pypi: ['tortoise-orm'] },
  }),
  db({
    name: 'GORM',
    langs: ['Go'],
    topics: ['gorm'],
    deps: { go: ['gorm.io/gorm', 'github.com/jinzhu/gorm'] },
    badge: ['00ADD8', 'go', 'ffffff'],
  }),
  db({
    name: 'Entity Framework',
    langs: DOTNET,
    topics: ['entity-framework', 'entity-framework-core', 'efcore'],
    deps: { nuget: ['Microsoft.EntityFrameworkCore*'] },
    badge: ['512BD4', 'dotnet', 'ffffff'],
  }),
];
