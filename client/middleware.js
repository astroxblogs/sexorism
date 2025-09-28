// This config object tells Vercel to run this middleware ONLY on page routes,
// ignoring all static files, images, and API calls.
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets|robots\\.txt).*)',
};

// A list of common bot user agents to check against.
const BOT_USER_AGENTS = [ 'googlebot', 'yahoo! slurp', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit', 'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview', 'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkshare', 'w3c_validator', 'whatsapp'];

// This is our new, custom middleware function.
export default function middleware(request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // Check if the visitor is a bot.
  const isBot = BOT_USER_AGENTS.some((bot) => userAgent.includes(bot));

  // If it's a bot, fetch the prerendered page.
  if (isBot) {
    const url = request.nextUrl;
    const host = request.headers.get('host');
    const targetUrl = `https://${host}${url.pathname}${url.search}`;
    const prerenderUrl = `https://service.prerender.io/${targetUrl}`;

    // Fetch the prerendered HTML and return it to the bot.
    return fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': process.env.PRERENDER_TOKEN,
        'User-Agent': userAgent, 
      },
    });
  }
}