export interface LicenseEntry {
  name: string;
  version: string;
  license: string;
  url: string;
}

function npmEntry(name: string, version: string, license: string): LicenseEntry {
  return { name, version, license, url: `https://www.npmjs.com/package/${name}` };
}

function pypiEntry(name: string, version: string, license: string): LicenseEntry {
  return { name, version, license, url: `https://pypi.org/project/${name}/` };
}

const RAW_LICENSES: LicenseEntry[] = [
  // 프론트엔드 (npm)
  npmEntry("@aws-sdk/client-s3", "3.1081.0", "Apache-2.0"),
  npmEntry("@aws-sdk/s3-request-presigner", "3.1081.0", "Apache-2.0"),
  npmEntry("@base-ui/react", "1.6.0", "MIT"),
  npmEntry("@react-three/drei", "10.7.7", "MIT"),
  npmEntry("@react-three/fiber", "9.6.1", "MIT"),
  npmEntry("@tanstack/react-query", "5.101.2", "MIT"),
  npmEntry("@tanstack/react-query-devtools", "5.101.2", "MIT"),
  npmEntry("@tanstack/react-table", "8.21.3", "MIT"),
  npmEntry("@zxing/browser", "0.2.1", "MIT"),
  npmEntry("@zxing/library", "0.23.0", "Apache-2.0"),
  npmEntry("axios", "1.18.1", "MIT"),
  npmEntry("browser-image-compression", "2.0.2", "MIT"),
  npmEntry("class-variance-authority", "0.7.1", "Apache-2.0"),
  npmEntry("clsx", "2.1.1", "MIT"),
  npmEntry("idb", "8.0.3", "ISC"),
  npmEntry("jotai", "2.20.1", "MIT"),
  npmEntry("lucide-react", "1.23.0", "ISC"),
  npmEntry("next", "16.2.9", "MIT"),
  npmEntry("qrcode.react", "4.2.0", "ISC"),
  npmEntry("react", "19.2.4", "MIT"),
  npmEntry("react-dom", "19.2.4", "MIT"),
  npmEntry("recharts", "3.10.1", "MIT"),
  npmEntry("shadcn", "4.12.0", "MIT"),
  npmEntry("sonner", "2.0.7", "MIT"),
  npmEntry("tailwind-merge", "3.6.0", "MIT"),
  npmEntry("three", "0.185.1", "MIT"),
  npmEntry("tw-animate-css", "1.4.0", "MIT"),
  npmEntry("xlsx", "0.18.5", "Apache-2.0"),

  // 백엔드 (PyPI)
  pypiEntry("fastapi", "0.138.2", "MIT"),
  pypiEntry("uvicorn", "0.49.0", "BSD-3-Clause"),
  pypiEntry("sqlmodel", "0.0.39", "MIT"),
  pypiEntry("psycopg2-binary", "2.9.12", "LGPL(예외 조항 포함)"),
  pypiEntry("pydantic-settings", "2.14.2", "MIT"),
  pypiEntry("pyjwt", "2.13.0", "MIT"),
  pypiEntry("pwdlib", "0.3.0", "MIT"),
  pypiEntry("email-validator", "2.3.0", "Unlicense"),
  pypiEntry("httpx", "0.28.1", "BSD-3-Clause"),
  pypiEntry("langchain", "1.3.11", "MIT"),
  pypiEntry("langgraph", "1.2.7", "MIT"),
  pypiEntry("langchain-openai", "1.3.3", "MIT"),
  pypiEntry("langgraph-checkpoint", "4.1.1", "MIT"),
  pypiEntry("langchain-chroma", "1.1.0", "MIT"),
  pypiEntry("chromadb", "1.5.9", "Apache-2.0"),
  pypiEntry("pyyaml", "6.0.3", "MIT"),
  pypiEntry("celery", "5.6.3", "BSD-3-Clause"),
  pypiEntry("redis", "8.0.1", "MIT"),
  pypiEntry("gevent", "26.5.0", "MIT"),
  pypiEntry("langchain-text-splitters", "1.1.2", "MIT"),
  pypiEntry("langchain-community", "0.4.2", "MIT"),
  pypiEntry("pandas", "3.0.3", "BSD-3-Clause"),
  pypiEntry("openpyxl", "3.1.5", "MIT"),
  pypiEntry("python-multipart", "0.0.32", "Apache-2.0"),
  pypiEntry("alembic", "1.19.0", "MIT"),
];

export const OPEN_SOURCE_LICENSES: LicenseEntry[] = [...RAW_LICENSES].sort((a, b) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" })
);
