/** @type {import('next').NextConfig} */
const nextConfig = {
  // 移除 output: 'export' 配置，因为管理后台通常不需要静态导出
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
