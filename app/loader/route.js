export const dynamic = 'force-dynamic';

const loader = "local scripts = {\n  [\"5166944221\"] = \"c12d7a4a94f0d10c27f21ff462e781d5\",\n  [\"7028566528\"] = \"9dd3ccd48c3e87b1a223d0a175fc6876\",\n  [\"6739698191\"] = \"b64eaf788b0c15c54c17ee96a133bc7a\",\n  [\"10007567876\"] = \"6aff1732647e82be5eeb8ebb108710a1\",\n  [\"964540701\"] = \"e8eb78843c7babd4c1cf673c832ed54a\",\n  [\"7738524573\"] = \"3c8cbc7e049bf4f49bac804b6d20b337\",\n  [\"4783811486\"] = \"2c7eb16a08c32a940d6df4fedceae130\"\n}\n\nlocal id = scripts[tostring(game.GameId)]\nif not id then\n  return\nend\n\nlocal env = (type(getgenv) == \"function\" and getgenv()) or _G\nlocal key = env.script_key or script_key\nif type(key) ~= \"string\" or #key ~= 32 then\n  return\nend\n\nlocal sdkLoaded, api = pcall(function()\n  return loadstring(game:HttpGet(\"https://sdkapi-public.luarmor.net/library.lua\"))()\nend)\nif not sdkLoaded or type(api) ~= \"table\" then\n  return\nend\n\napi.script_id = id\nlocal keyChecked, status = pcall(function()\n  return api.check_key(key)\nend)\nif not keyChecked or type(status) ~= \"table\" or status.code ~= \"KEY_VALID\" then\n  return\nend\n\nenv.script_key = key\n_G.script_key = key\nscript_key = key\n\npcall(function()\n  api.load_script()\nend)\n";

export function GET(request) {
  const mode = request.headers.get('sec-fetch-mode');
  const destination = request.headers.get('sec-fetch-dest');
  const accept = request.headers.get('accept') || '';
  const isPageNavigation =
    mode === 'navigate' ||
    destination === 'document' ||
    accept.includes('text/html');

  if (isPageNavigation) {
    return Response.redirect(new URL('/', request.url), 302);
  }

  return new Response(loader, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Sec-Fetch-Mode, Sec-Fetch-Dest, Accept'
    }
  });
}
