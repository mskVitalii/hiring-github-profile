import { describe, expect, it } from 'vitest';
import { parseManifest, selectManifestPaths } from './manifests';

const deps = (path: string, content: string) =>
  parseManifest(path, content)?.deps ?? [];

describe('parseManifest', () => {
  it('reads package.json deps and TypeScript usage', () => {
    const m = parseManifest(
      'package.json',
      '{"dependencies":{"react":"1"},"devDependencies":{"typescript":"5"}}',
    );
    expect(m).toMatchObject({ ecosystem: 'npm', deps: ['react', 'typescript'], typescript: true });
  });

  it('skips indirect go.mod requirements', () => {
    const goMod = `module x

go 1.22

require (
\tgithub.com/gin-gonic/gin v1.9.1
\tgo.opentelemetry.io/otel v1.24.0
)

require (
\tcloud.google.com/go/compute v1.0.0 // indirect
\tgoogle.golang.org/grpc v1.62.0 // indirect
)
`;
    expect(deps('go.mod', goMod)).toEqual([
      'github.com/gin-gonic/gin',
      'go.opentelemetry.io/otel',
    ]);
  });

  it('reads PEP 621 and Poetry dependencies from pyproject.toml', () => {
    const pep621 = `[project]
name = "bot"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "tortoise-orm>=0.21.0",
]

[project.optional-dependencies]
dev = ["pytest>=8"]
`;
    expect(deps('pyproject.toml', pep621)).toEqual([
      'fastapi',
      'uvicorn',
      'tortoise-orm',
      'pytest',
    ]);

    const poetry = `[tool.poetry.dependencies]
python = "^3.12"
Django = "^5.0"
`;
    expect(deps('pyproject.toml', poetry)).toEqual(['django']);
  });

  it('reads requirements.txt, Cargo.toml, Gemfile and csproj', () => {
    expect(deps('requirements.txt', 'Flask==3.0\n# comment\n-r base.txt\nnumpy>=1\n')).toEqual(['flask', 'numpy']);
    expect(deps('Cargo.toml', '[dependencies]\naxum = "0.7"\ntokio = { version = "1" }\n')).toEqual(['axum', 'tokio']);
    expect(deps('Gemfile', "source 'x'\ngem 'rails', '~> 7'\n")).toEqual(['rails']);
    expect(
      deps(
        'Api/Api.csproj',
        '<Project Sdk="Microsoft.NET.Sdk.Web"><ItemGroup><PackageReference Include="Npgsql" /></ItemGroup></Project>',
      ),
    ).toEqual(['Npgsql', 'Microsoft.NET.Sdk.Web']);
  });

  it('returns null for malformed content instead of throwing', () => {
    expect(parseManifest('package.json', '{not json')).toBeNull();
  });
});

describe('selectManifestPaths', () => {
  it('prefers shallow manifests and skips vendored/example code', () => {
    expect(
      selectManifestPaths([
        'examples/demo/package.json',
        'client/package.json',
        'node_modules/react/package.json',
        'server/go.mod',
        'package.json',
        'a/b/c/d/package.json',
      ]),
    ).toEqual(['package.json', 'client/package.json', 'server/go.mod']);
  });
});
