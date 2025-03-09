/** @type {import('next').NextConfig} */
const nextConfig = {
  // 출력 모드를 'standalone'으로 설정하여 AWS Amplify에서 SSR을 지원하도록 함
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    domains: [],
    // AWS Amplify에서 이미지 최적화를 위한 설정
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // 웹팩 설정
  webpack: (config, { dev, isServer }) => {
    // 개발 환경에서 캐시 비활성화
    if (dev) {
      config.cache = false;
    }
    
    // AWS Lambda 환경에서 서버 액션 지원을 위한 설정
    if (isServer) {
      // 서버 액션을 위한 폴리필 추가
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
        path: false,
      };
    }
    
    return config;
  },
  
  // 빌드 시 진행 상황 표시 개선
  onDemandEntries: {
    // 페이지 유지 시간 (ms)
    maxInactiveAge: 60 * 1000,
    // 동시에 유지할 페이지 수
    pagesBufferLength: 2,
  },
  
  // 서버 액션 관련 설정
  experimental: {
    serverActions: {
      // 서버 액션 허용
      allowedOrigins: ['localhost:3000', '*.amplifyapp.com'],
      // 서버 액션 타임아웃 설정 (ms)
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig; 