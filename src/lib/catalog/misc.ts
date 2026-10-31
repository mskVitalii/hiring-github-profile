import { JS_TS, JVM } from './languages';
import type { CategoryId, TechDef } from './types';

const make =
  (category: CategoryId) =>
  (def: Omit<TechDef, 'category'>): TechDef => ({ category, ...def });

const ml = make('ml');
const test = make('testing');
const tool = make('tools');

export const ML: TechDef[] = [
  ml({
    name: 'PyTorch',
    langs: ['Python'],
    topics: ['pytorch', 'torch'],
    deps: { pypi: ['torch', 'pytorch-lightning', 'lightning'] },
    badge: ['EE4C2C', 'pytorch', 'ffffff'],
  }),
  ml({
    name: 'TensorFlow',
    langs: ['Python', ...JS_TS],
    topics: ['tensorflow', 'keras', 'tensorflowjs'],
    deps: { pypi: ['tensorflow', 'keras'], npm: ['@tensorflow/*'] },
    badge: ['FF6F00', 'tensorflow', 'ffffff'],
  }),
  ml({
    name: 'Scikit-learn',
    langs: ['Python'],
    topics: ['scikit-learn', 'sklearn'],
    deps: { pypi: ['scikit-learn', 'sklearn'] },
    badge: ['F7931E', 'scikitlearn', 'ffffff'],
  }),
  ml({
    name: 'Pandas',
    langs: ['Python'],
    topics: ['pandas'],
    deps: { pypi: ['pandas', 'polars'] },
    badge: ['150458', 'pandas', 'ffffff'],
  }),
  ml({
    name: 'NumPy',
    langs: ['Python'],
    topics: ['numpy'],
    deps: { pypi: ['numpy'] },
    badge: ['013243', 'numpy', 'ffffff'],
  }),
  ml({
    name: 'Jupyter',
    linguist: ['Jupyter Notebook'],
    topics: ['jupyter', 'jupyter-notebook'],
    badge: ['F37626', 'jupyter', 'ffffff'],
  }),
  ml({
    name: 'Hugging Face',
    langs: ['Python', ...JS_TS],
    topics: ['huggingface', 'hugging-face', 'transformers'],
    deps: {
      pypi: ['transformers', 'sentence-transformers', 'huggingface-hub', 'datasets'],
      npm: ['@huggingface/*', '@xenova/transformers'],
    },
    badge: ['FFD21E', 'huggingface', '000000'],
  }),
  ml({
    name: 'OpenAI API',
    topics: ['openai', 'openai-api', 'chatgpt', 'gpt-4'],
    deps: {
      pypi: ['openai'],
      npm: ['openai', '@ai-sdk/openai'],
      go: ['github.com/sashabaranov/go-openai', 'github.com/openai/openai-go'],
    },
    badge: ['412991', 'openai', 'ffffff'],
  }),
  ml({
    name: 'Anthropic API',
    topics: ['anthropic', 'claude', 'claude-api'],
    deps: {
      pypi: ['anthropic'],
      npm: ['@anthropic-ai/sdk', '@ai-sdk/anthropic'],
      go: ['github.com/anthropics/anthropic-sdk-go'],
    },
    badge: ['191919', 'anthropic', 'ffffff'],
  }),
  ml({
    name: 'LangChain',
    langs: ['Python', ...JS_TS],
    topics: ['langchain', 'langgraph'],
    deps: { pypi: ['langchain*', 'langgraph'], npm: ['langchain', '@langchain/*'] },
    badge: ['1C3C3C', 'langchain', 'ffffff'],
  }),
  ml({
    name: 'Ollama',
    topics: ['ollama'],
    deps: { pypi: ['ollama'], npm: ['ollama'] },
    compose: /\bollama\b/,
    badge: ['000000', 'ollama', 'ffffff'],
  }),
];

export const TESTING: TechDef[] = [
  test({
    name: 'Jest',
    langs: JS_TS,
    topics: ['jest'],
    deps: { npm: ['jest', 'ts-jest', '@jest/*'] },
    files: [/(^|\/)jest\.config\.[cm]?[jt]s(on)?$/],
    badge: ['C21325', 'jest', 'ffffff'],
  }),
  test({
    name: 'Vitest',
    langs: JS_TS,
    topics: ['vitest'],
    deps: { npm: ['vitest'] },
    files: [/(^|\/)vitest\.config\.[cm]?[jt]s$/],
    badge: ['6E9F18', 'vitest', 'ffffff'],
  }),
  test({
    name: 'Testing Library',
    langs: JS_TS,
    topics: ['testing-library', 'react-testing-library'],
    deps: { npm: ['@testing-library/*'] },
    badge: ['E33332', 'testinglibrary', 'ffffff'],
  }),
  test({
    name: 'Cypress',
    langs: JS_TS,
    topics: ['cypress'],
    deps: { npm: ['cypress'] },
    files: [/(^|\/)cypress\.config\.[cm]?[jt]s$/, /(^|\/)cypress\//],
    badge: ['17202C', 'cypress', 'ffffff'],
  }),
  test({
    name: 'Playwright',
    topics: ['playwright'],
    deps: { npm: ['@playwright/test', 'playwright'], pypi: ['playwright', 'pytest-playwright'] },
    files: [/(^|\/)playwright\.config\.[cm]?[jt]s$/],
    badge: ['2EAD33', 'playwright', 'ffffff'],
  }),
  test({
    name: 'Mocha',
    langs: JS_TS,
    topics: ['mocha'],
    deps: { npm: ['mocha'] },
    files: [/(^|\/)\.mocharc(\.[a-z]+)?$/],
    badge: ['8D6748', 'mocha', 'ffffff'],
  }),
  test({
    name: 'Storybook',
    langs: JS_TS,
    topics: ['storybook'],
    deps: { npm: ['storybook', '@storybook/*'] },
    files: [/(^|\/)\.storybook\//, /\.stories\.[cm]?[jt]sx?$/],
    badge: ['FF4785', 'storybook', 'ffffff'],
  }),
  test({
    name: 'Pytest',
    langs: ['Python'],
    topics: ['pytest'],
    deps: { pypi: ['pytest'] },
    files: [/(^|\/)pytest\.ini$/, /(^|\/)conftest\.py$/],
    badge: ['0A9EDC', 'pytest', 'ffffff'],
  }),
  test({
    name: 'JUnit',
    langs: JVM,
    topics: ['junit', 'junit5'],
    deps: { maven: ['junit*', 'org.junit*'] },
    badge: ['25A162', 'junit5', 'ffffff'],
  }),
];

export const TOOLS: TechDef[] = [
  tool({
    name: 'GraphQL',
    topics: ['graphql', 'apollo', 'apollo-graphql'],
    keywords: ['graphql'],
    deps: {
      npm: ['graphql', '@apollo/*', 'apollo-server*', 'urql'],
      pypi: ['graphene', 'strawberry-graphql', 'ariadne'],
      go: ['github.com/99designs/gqlgen', 'github.com/graphql-go/graphql'],
      cargo: ['async-graphql', 'juniper'],
    },
    badge: ['E10098', 'graphql', 'ffffff'],
  }),
  tool({
    name: 'gRPC',
    topics: ['grpc', 'protobuf'],
    keywords: ['grpc'],
    deps: {
      npm: ['@grpc/grpc-js'],
      pypi: ['grpcio'],
      go: ['google.golang.org/grpc'],
      cargo: ['tonic'],
      nuget: ['Grpc.*'],
    },
    files: [/\.proto$/],
    badge: ['244C5A', 'grpc', 'ffffff'],
  }),
  tool({
    name: 'tRPC',
    langs: JS_TS,
    topics: ['trpc'],
    deps: { npm: ['@trpc/server'] },
    badge: ['2596BE', 'trpc', 'ffffff'],
  }),
  tool({
    name: 'WebSocket',
    topics: ['websocket', 'websockets', 'socket-io', 'socketio'],
    deps: {
      npm: ['ws', 'socket.io', 'socket.io-client'],
      pypi: ['websockets', 'python-socketio'],
      go: ['github.com/gorilla/websocket', 'nhooyr.io/websocket', 'github.com/coder/websocket'],
    },
    badge: ['010101', 'socketdotio', 'ffffff'],
  }),
  tool({
    name: 'Kafka',
    topics: ['kafka', 'apache-kafka', 'redpanda'],
    keywords: ['kafka'],
    deps: {
      npm: ['kafkajs'],
      pypi: ['confluent-kafka', 'kafka-python', 'aiokafka'],
      go: ['github.com/segmentio/kafka-go', 'github.com/IBM/sarama', 'github.com/Shopify/sarama', 'github.com/twmb/franz-go*'],
    },
    compose: /\b(kafka|redpanda)\b/,
    badge: ['231F20', 'apachekafka', 'ffffff'],
  }),
  tool({
    name: 'RabbitMQ',
    topics: ['rabbitmq', 'amqp'],
    keywords: ['rabbitmq'],
    deps: {
      npm: ['amqplib'],
      pypi: ['pika', 'aio-pika'],
      go: ['github.com/rabbitmq/amqp091-go', 'github.com/streadway/amqp'],
    },
    compose: /\brabbitmq\b/,
    badge: ['FF6600', 'rabbitmq', 'ffffff'],
  }),
  tool({
    name: 'NATS',
    topics: ['nats'],
    deps: { npm: ['nats'], pypi: ['nats-py'], go: ['github.com/nats-io/nats.go'] },
    compose: /\bnats\b/,
    badge: ['27AAE1', 'natsdotio', 'ffffff'],
  }),
  tool({
    name: 'OpenAPI',
    topics: ['openapi', 'swagger'],
    deps: {
      npm: ['swagger-ui-express', '@nestjs/swagger'],
      go: ['github.com/swaggo/*'],
      maven: ['springdoc-openapi*'],
      nuget: ['Swashbuckle*'],
    },
    files: [/(^|\/)(openapi|swagger)\.(ya?ml|json)$/],
    badge: ['6BA539', 'openapiinitiative', 'ffffff'],
  }),
  tool({
    name: 'Telegram Bots',
    topics: ['telegram-bot', 'telegram', 'aiogram', 'telegraf'],
    keywords: ['telegram bot'],
    deps: {
      pypi: ['aiogram', 'python-telegram-bot', 'pytelegrambotapi', 'telethon'],
      npm: ['telegraf', 'grammy', 'node-telegram-bot-api'],
      go: ['github.com/go-telegram-bot-api/*', 'gopkg.in/telebot*', 'github.com/go-telegram/bot'],
    },
    badge: ['26A5E4', 'telegram', 'ffffff'],
  }),
  tool({
    name: 'JWT',
    topics: ['jwt', 'json-web-token'],
    deps: {
      npm: ['jsonwebtoken', 'jose'],
      pypi: ['pyjwt', 'python-jose'],
      go: ['github.com/golang-jwt/jwt*', 'github.com/appleboy/gin-jwt*'],
    },
    badge: ['000000', 'jsonwebtokens', 'ffffff'],
  }),
  tool({
    name: 'OAuth',
    topics: ['oauth', 'oauth2', 'openid-connect'],
    deps: { npm: ['next-auth', '@auth/*', 'passport'], go: ['golang.org/x/oauth2'] },
    badge: ['000000', 'auth0', 'ffffff'],
  }),
  tool({
    name: 'Vite',
    langs: JS_TS,
    topics: ['vite', 'vitejs'],
    deps: { npm: ['vite'] },
    files: [/(^|\/)vite\.config\.[cm]?[jt]s$/],
    badge: ['646CFF', 'vite', 'ffffff'],
  }),
  tool({
    name: 'Webpack',
    langs: JS_TS,
    topics: ['webpack'],
    deps: { npm: ['webpack'] },
    files: [/(^|\/)webpack\.config\.[cm]?[jt]s$/],
    badge: ['8DD6F9', 'webpack', '000000'],
  }),
  tool({
    name: 'Bun',
    langs: JS_TS,
    topics: ['bun', 'bunjs'],
    files: [/(^|\/)bun\.lockb?$/, /(^|\/)bunfig\.toml$/],
    badge: ['000000', 'bun', 'ffffff'],
  }),
  tool({
    name: 'Turborepo',
    langs: JS_TS,
    topics: ['turborepo'],
    deps: { npm: ['turbo'] },
    files: [/^turbo\.json$/],
    badge: ['EF4444', 'turborepo', 'ffffff'],
  }),
  tool({
    name: 'Nx',
    langs: JS_TS,
    topics: ['nx', 'nrwl'],
    files: [/^nx\.json$/],
    badge: ['143055', 'nx', 'ffffff'],
  }),
  tool({
    name: 'Microservices',
    topics: ['microservices', 'microservice'],
  }),
];
