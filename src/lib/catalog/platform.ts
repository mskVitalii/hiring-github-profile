import { JS_TS, JVM } from './languages';
import type { CategoryId, TechDef } from './types';

const make =
  (category: CategoryId) =>
  (def: Omit<TechDef, 'category'>): TechDef => ({ category, ...def });

const ops = make('devops');
const mobile = make('mobile');

export const DEVOPS: TechDef[] = [
  ops({
    name: 'Docker',
    linguist: ['Dockerfile'],
    minShare: 0,
    topics: ['docker', 'dockerfile', 'docker-compose'],
    keywords: ['docker'],
    files: [
      /(^|\/)dockerfile(\.[^/]*)?$/,
      /(^|\/)(docker-)?compose([.-][a-z0-9_-]+)?\.ya?ml$/,
    ],
    badge: ['2496ED', 'docker', 'ffffff'],
  }),
  ops({
    name: 'Kubernetes',
    topics: ['kubernetes', 'k8s', 'kubectl', 'kustomize'],
    keywords: ['kubernetes'],
    files: [
      /(^|\/)(k8s|kubernetes|kube)\//,
      /(^|\/)kustomization\.ya?ml$/,
      /(^|\/)skaffold\.ya?ml$/,
    ],
    badge: ['326CE5', 'kubernetes', 'ffffff'],
  }),
  ops({
    name: 'Helm',
    topics: ['helm', 'helm-chart', 'helmfile'],
    files: [/(^|\/)chart\.ya?ml$/, /(^|\/)helmfile\.ya?ml$/],
    implies: ['Kubernetes'],
    badge: ['0F1689', 'helm', 'ffffff'],
  }),
  ops({
    name: 'ArgoCD',
    topics: ['argocd', 'argo-cd'],
    badge: ['EF7B4D', 'argo', 'ffffff'],
  }),
  ops({
    name: 'Terraform',
    linguist: ['HCL'],
    minShare: 0,
    topics: ['terraform', 'opentofu'],
    keywords: ['terraform'],
    files: [/\.tf$/, /\.tfvars$/],
    badge: ['844FBA', 'terraform', 'ffffff'],
  }),
  ops({
    name: 'Ansible',
    topics: ['ansible', 'ansible-playbook'],
    files: [
      /(^|\/)ansible(\/|\.cfg$)/,
      /(^|\/)playbooks?\/[^/]+\.ya?ml$/,
      /(^|\/)galaxy\.yml$/,
    ],
    badge: ['EE0000', 'ansible', 'ffffff'],
  }),
  ops({
    name: 'GitHub Actions',
    topics: ['github-actions', 'github-action'],
    files: [/^\.github\/workflows\/[^/]+\.ya?ml$/],
    badge: ['2088FF', 'githubactions', 'ffffff'],
  }),
  ops({
    name: 'GitLab CI',
    topics: ['gitlab-ci'],
    files: [/^\.gitlab-ci\.ya?ml$/],
    badge: ['FC6D26', 'gitlab', 'ffffff'],
  }),
  ops({
    name: 'Jenkins',
    topics: ['jenkins'],
    files: [/(^|\/)jenkinsfile$/],
    badge: ['D24939', 'jenkins', 'ffffff'],
  }),
  ops({
    name: 'Nginx',
    topics: ['nginx'],
    files: [/(^|\/)nginx[^/]*\.conf$/, /(^|\/)nginx\//],
    compose: /\bnginx\b/,
    badge: ['009639', 'nginx', 'ffffff'],
  }),
  ops({
    name: 'Prometheus',
    topics: ['prometheus'],
    deps: {
      npm: ['prom-client'],
      pypi: ['prometheus-client', 'prometheus-fastapi-instrumentator'],
      go: ['github.com/prometheus/client_golang'],
    },
    compose: /\bprometheus\b/,
    badge: ['E6522C', 'prometheus', 'ffffff'],
  }),
  ops({
    name: 'Grafana',
    topics: ['grafana', 'grafana-loki', 'loki'],
    compose: /\bgrafana\b/,
    badge: ['F46800', 'grafana', 'ffffff'],
  }),
  ops({
    name: 'OpenTelemetry',
    topics: ['opentelemetry', 'otel', 'jaeger'],
    deps: {
      npm: ['@opentelemetry/*'],
      pypi: ['opentelemetry-*'],
      go: ['go.opentelemetry.io/otel*'],
    },
    compose: /\b(jaeger|otel-collector|opentelemetry)\b/,
    badge: ['000000', 'opentelemetry', 'ffffff'],
  }),
  ops({
    name: 'AWS',
    topics: ['aws', 'amazon-web-services', 'aws-lambda', 'aws-s3'],
    keywords: ['aws'],
    deps: {
      npm: ['aws-sdk', '@aws-sdk/*', 'aws-cdk-lib'],
      pypi: ['boto3', 'aws-cdk-lib'],
      go: ['github.com/aws/aws-sdk-go*'],
    },
    badge: ['FF9900', 'amazonwebservices', '000000'],
  }),
  ops({
    name: 'Google Cloud',
    topics: ['gcp', 'google-cloud', 'google-cloud-platform'],
    deps: {
      npm: ['@google-cloud/*'],
      pypi: ['google-cloud-*'],
      go: ['cloud.google.com/go*'],
    },
    badge: ['4285F4', 'googlecloud', 'ffffff'],
  }),
  ops({
    name: 'Azure',
    topics: ['azure', 'microsoft-azure', 'azure-blob-storage', 'azure-functions'],
    deps: { npm: ['@azure/*'], pypi: ['azure-*'], nuget: ['Azure.*'] },
    badge: ['0078D4', 'microsoftazure', 'ffffff'],
  }),
  ops({
    name: 'Vercel',
    topics: ['vercel'],
    files: [/^vercel\.json$/],
    deps: { npm: ['@vercel/*'] },
    badge: ['000000', 'vercel', 'ffffff'],
  }),
  ops({
    name: 'Cloudflare',
    topics: ['cloudflare', 'cloudflare-workers'],
    files: [/(^|\/)wrangler\.(toml|jsonc?)$/],
    deps: { npm: ['wrangler'] },
    badge: ['F38020', 'cloudflare', 'ffffff'],
  }),
];

export const MOBILE: TechDef[] = [
  mobile({
    name: 'React Native',
    langs: JS_TS,
    topics: ['react-native', 'reactnative'],
    keywords: ['react native'],
    deps: { npm: ['react-native'] },
    badge: ['61DAFB', 'react', '000000'],
  }),
  mobile({
    name: 'Expo',
    langs: JS_TS,
    topics: ['expo'],
    deps: { npm: ['expo'] },
    implies: ['React Native'],
    badge: ['000020', 'expo', 'ffffff'],
  }),
  mobile({
    name: 'Flutter',
    langs: ['Dart'],
    topics: ['flutter'],
    deps: { pub: ['flutter'] },
    badge: ['02569B', 'flutter', 'ffffff'],
  }),
  mobile({
    name: 'iOS',
    langs: ['Swift', 'Objective-C'],
    topics: ['ios', 'ios-app', 'uikit'],
    files: [/\.xcodeproj\//],
    badge: ['000000', 'apple', 'ffffff'],
  }),
  mobile({
    name: 'SwiftUI',
    langs: ['Swift'],
    topics: ['swiftui'],
    keywords: ['swiftui'],
    badge: ['FA7343', 'swift', 'ffffff'],
  }),
  mobile({
    name: 'Android',
    langs: [...JVM, 'C++'],
    topics: ['android', 'android-app'],
    files: [/(^|\/)androidmanifest\.xml$/],
    badge: ['34A853', 'android', 'ffffff'],
  }),
  mobile({
    name: 'Jetpack Compose',
    langs: ['Kotlin'],
    topics: ['jetpack-compose'],
    deps: { maven: ['androidx.compose*', 'compose-*'] },
    badge: ['4285F4', 'jetpackcompose', 'ffffff'],
  }),
  mobile({
    name: 'Electron',
    langs: JS_TS,
    topics: ['electron'],
    deps: { npm: ['electron'] },
    badge: ['47848F', 'electron', 'ffffff'],
  }),
  mobile({
    name: 'Tauri',
    langs: ['Rust', ...JS_TS],
    topics: ['tauri'],
    deps: { cargo: ['tauri'], npm: ['@tauri-apps/api'] },
    badge: ['24C8DB', 'tauri', 'ffffff'],
  }),
  mobile({
    name: 'Unity',
    langs: ['C#'],
    topics: ['unity', 'unity3d'],
    files: [/(^|\/)projectsettings\/projectversion\.txt$/],
    badge: ['000000', 'unity', 'ffffff'],
  }),
];
