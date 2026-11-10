// Version every module along with the entrypoint to avoid mixed deployments.
const version = new URL(import.meta.url).searchParams.get('v') || 'local';
const features = [
  ['navigation', 'initNavigation'], ['search', 'initSearch'],
  ['toc', 'initToc'], ['reading-tools', 'initReadingTools'],
  ['companions', 'initCompanions'],
  ['motion', 'initMotion'],
];
await Promise.all(features.map(async ([file, initialise]) => {
  try {
    const url = new URL('./modules/' + file + '.js', import.meta.url);
    url.searchParams.set('v', version);
    const module = await import(url.href);
    module[initialise]();
  } catch (error) { console.error('[HapBok]', error); }
}));
