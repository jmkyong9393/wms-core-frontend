/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // 모바일 테스트를 위한 로컬 IP 허용
  allowedDevOrigins: ['192.168.0.50'],
};

export default nextConfig;
