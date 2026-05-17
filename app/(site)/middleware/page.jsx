import { ContextAlert } from 'components/context-alert';
import { Markdown } from 'components/markdown';

export const metadata = {
    title: 'Middleware'
};

const explainer = `
This page demonstrates the repo's Next.js middleware in \`middleware.js\`.

The middleware logs requests, applies a few response headers, adds an API
version header for API routes, and redirects \`/admin\` traffic back to the
homepage.
`;

const codeSnippet = `
~~~js
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  console.log(\`[\${new Date().toISOString()}] \${request.method} \${request.nextUrl.pathname}\`);

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  const pathname = request.nextUrl.pathname;

  // Add API versioning header
  if (pathname.startsWith('/api')) {
    response.headers.set('X-API-Version', '1.0');
  }

  // Block access to /admin paths
  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}
~~~
`;

export default function Page() {
    return (
        <>
            <ContextAlert className="mb-6" />
            <h1 className="mb-8">Middleware</h1>
            <Markdown content={explainer} className="mb-8" />
            <Markdown content={codeSnippet} />
        </>
    );
}
