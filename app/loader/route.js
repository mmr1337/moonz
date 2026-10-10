export const dynamic = 'force-dynamic';

const loader = "local available = {\n  [\"c12d7a4a94f0d10c27f21ff462e781d5\"] = true,\n  [\"3c8cbc7e049bf4f49bac804b6d20b337\"] = true,\n  [\"2c7eb16a08c32a940d6df4fedceae130\"] = true,\n  [\"b64eaf788b0c15c54c17ee96a133bc7a\"] = true,\n  [\"9dd3ccd48c3e87b1a223d0a175fc6876\"] = true,\n  [\"e8eb78843c7babd4c1cf673c832ed54a\"] = true,\n  [\"6aff1732647e82be5eeb8ebb108710a1\"] = true\n}\n\nlocal env = (type(getgenv) == \"function\" and getgenv()) or _G\nlocal id = env.moon_selected_id or moon_selected_id or \"c12d7a4a94f0d10c27f21ff462e781d5\"\nlocal key = env.script_key or script_key\n\nif type(id) ~= \"string\" or not available[id] then\n  warn(\"[moon] Invalid script ID\")\n  return\nend\n\nif type(key) ~= \"string\" or #key ~= 32 then\n  warn(\"[moon] Set script_key to your 32-character Luarmor key before loading\")\n  return\nend\n\nlocal success, api = pcall(function()\n  return loadstring(game:HttpGet(\"https://sdkapi-public.luarmor.net/library.lua\"))()\nend)\n\nif not success or type(api) ~= \"table\" then\n  warn(\"[moon] Luarmor SDK failed to load\")\n  return\nend\n\napi.script_id = id\n\nlocal checked, status = pcall(function()\n  return api.check_key(key)\nend)\n\nif not checked or type(status) ~= \"table\" then\n  warn(\"[moon] Unable to verify Luarmor key\")\n  return\nend\n\nif status.code ~= \"KEY_VALID\" then\n  warn(\"[moon] \" .. tostring(status.code) .. \": \" .. tostring(status.message or \"Key rejected\"))\n  return\nend\n\nenv.script_key = key\n_G.script_key = key\nscript_key = key\n\nlocal loaded, reason = pcall(function()\n  api.load_script()\nend)\n\nif not loaded then\n  warn(\"[moon] Script loading failed: \" .. tostring(reason))\nend\n";

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
