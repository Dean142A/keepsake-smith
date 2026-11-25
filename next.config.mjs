/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.thekeepsakesmith.com',
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
      },
    ],
  },
  async headers() {
    return [
      {
        // Global security headers
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Next inlines its bootstrap, and the 3D book builds page
            // textures on canvases, hence 'unsafe-inline' and blob:. The
            // value of the policy here is the connect/img/frame limits and
            // the ban on object embeds.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://*.b-cdn.net https://images.unsplash.com",
              "media-src 'self' blob: https://*.b-cdn.net",
              "connect-src 'self' https://*.b-cdn.net https://raw.githack.com https://cdn.jsdelivr.net",
              "worker-src 'self' blob:",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Static scene assets only. The API used to be in this list, which
        // invited every origin on the web to call /api/admin/*. Browsers
        // refuse a wildcard origin with credentials so the cookie was never
        // at risk, but there is no reason to advertise the endpoints.
        source: '/(textures|audios)/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
        ],
      },
    ];
  },
};

export default nextConfig;
