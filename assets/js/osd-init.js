document.addEventListener('DOMContentLoaded', () => {
  if (typeof OpenSeadragon === 'undefined') {
    console.error('OpenSeadragon library not loaded yet');
    return;
  }
  
  // ⬅️ Set this to your manifest URL
  const MANIFEST_URL = '/archives-exhibits-demo/objects/greater-throop-collection/manifest.json';

  // ---- Helpers for IIIF v2/v3 differences ----
  const getLang = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    // v3 label/metadata can be { en: ["Title"] } or { none: ["Title"] }
    const first = val.en?.[0] || val.none?.[0] || Object.values(val)[0]?.[0];
    return first || '';
  };

  const getCanvases = (manifest) => {
    // v3: manifest.items = canvases; v2: sequences[0].canvases
    if (manifest.items) return manifest.items;
    return manifest.sequences?.[0]?.canvases || [];
  };

  const canvasLabel = (canvas) => getLang(canvas.label || canvas['label']);
  const canvasThumb = (canvas) => {
    // v3: canvas.thumbnail[0].id or .url; v2: canvas.thumbnail['@id']
    const t = canvas.thumbnail?.[0] || canvas.thumbnail;
    return t?.id || t?.url || t?.['@id'] || null;
  };

  const firstImageService = (canvas) => {
    // v3: items[0].items[0].body.service[0].id (ImageService3 base)
    // v2: images[0].resource.service['@id'] (Image API 2 base)
    try {
      // v3 path
      const annopage = canvas.items?.[0];
      const anno = annopage?.items?.[0];
      const body = anno?.body;
      const service = Array.isArray(body?.service) ? body.service[0] : body?.service;
      return service?.id || service?.['@id'] || null;
    } catch { /* fallthrough */ }

    // v2 fallback
    const img = canvas.images?.[0]?.resource?.service;
    return img?.['@id'] || null;
  };

  const toInfoJson = (serviceId) => {
    if (!serviceId) return null;
    return serviceId.endsWith('/info.json') ? serviceId : (serviceId.replace(/\/$/, '') + '/info.json');
  };

  // --- CSV metadata helpers (Jekyll _data) ---
  function fileNameFromUrl(url) {
    try { return url.split('/').pop().split('?')[0]; } catch { return null; }
  }

  function objectIdFromCanvas(canvas) {
    // e.g. /objects/.../greater-throop-3/greater-throop-3.jpg -> "greater-throop-3"
    const body = canvas.items?.[0]?.items?.[0]?.body || canvas.images?.[0]?.resource;
    const url = body?.id || body?.['@id'];
    if (!url) return null;
    const parts = url.split('?')[0].split('/');
    return parts.length >= 2 ? parts[parts.length - 2] : null;
  }

  function csvMetaForCanvas(canvas) {
    const key = objectIdFromCanvas(canvas);
    return (key && window.CANVAS_META) ? window.CANVAS_META[key] : null;
  }

  function renderMetadataFromCsv(meta) {
    const box = document.getElementById('meta');
    if (!box) return;
    box.innerHTML = '';
    const add = (label, value) => {
      if (!value) return;
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      box.appendChild(dt); box.appendChild(dd);
    };
    add('Title', meta.title);
    add('Creator', meta.creator);
    add('Date', meta.date);
    add('Description', meta.description);
    add('Subject', meta.subject);
    add('Location', meta.location);
    add('Source', meta.source);
    add('Identifier', meta.identifier);
    add('Rights', meta.rights);
    add('Rights Statement', meta.rightsstatement);
  }

  function updateMetaVisibility() {
    const meta = document.getElementById('meta');
    const aside = document.querySelector('.osd-meta');
    if (!meta || !aside) return;
    aside.style.display = meta.children.length ? 'block' : 'none';
  }

  // ---- OpenSeadragon setup ----
  // Resolve toolbar icon path (works even if this JS isn’t Liquid-processed)
  const OSD_PREFIX = (typeof window.OSD_PREFIX === 'string' && window.OSD_PREFIX)
    ? window.OSD_PREFIX
    : '/archives-exhibits-demo/assets/img/openseadragon/'; // fallback; adjust if your baseurl changes
  const _prefixUrl = OSD_PREFIX.endsWith('/') ? OSD_PREFIX : OSD_PREFIX + '/';
  const viewer = OpenSeadragon({
    id: 'osd-viewer',
    prefixUrl: _prefixUrl,
    showNavigator: true,
    showRotationControl: true,
    visibilityRatio: 1,
    minZoomLevel: 0,
    gestureSettingsTouch: { pinchToZoom: true, flickEnabled: true }
  });

  async function loadManifest(url) {
    const res = await fetch(url);
    const manifest = await res.json();

    // Header
    document.getElementById('work-title').textContent = getLang(manifest.label) || 'Untitled';
    const summary = getLang(manifest.summary) || '';
    document.getElementById('work-sub').textContent = summary;

    // Canvases + optional manifest-level metadata
    const canvases = getCanvases(manifest);

    // Render manifest-level metadata first (if present) so we don't wipe out
    // the canvas metadata that `showCanvas` will insert afterwards.
    const manifestMeta = manifest.metadata || [];
    if (manifestMeta.length) {
      renderMetadata(manifestMeta);
    }

    // Build thumbs and open the first canvas (which will also render CSV/canvas metadata)
    renderThumbs(canvases);
    if (canvases.length) showCanvas(canvases[0]);

    updateMetaVisibility();
  }

  function renderThumbs(canvases) {
    const thumbs = document.getElementById('thumbs');
    thumbs.innerHTML = '';
    canvases.forEach((canvas, idx) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'thumb';
      el.setAttribute('aria-label', `Open ${canvasLabel(canvas) || 'item'} (${idx + 1})`);

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = '';
      img.src = canvasThumb(canvas) || ''; // if missing, OSD can still load via info.json
      el.appendChild(img);

      el.addEventListener('click', () => {
        showCanvas(canvas);
        // update selection style
        document.querySelectorAll('.thumb[aria-current="true"]').forEach(t => t.removeAttribute('aria-current'));
        el.setAttribute('aria-current', 'true');
      });

      thumbs.appendChild(el);
      if (idx === 0) el.setAttribute('aria-current', 'true');
    });
  }

  async function showCanvas(canvas) {
    // resolve IIIF Image API info.json for OSD
    const serviceBase = firstImageService(canvas);
    const infoUrl = toInfoJson(serviceBase);
    if (!infoUrl) {
      console.warn('No IIIF Image service for canvas; trying direct image');
      // try direct raster
      const body = canvas.items?.[0]?.items?.[0]?.body || canvas.images?.[0]?.resource;
      const url = body?.id || body?.['@id'];
      if (url) {
        viewer.open({ type: 'image', url });
        const csv = csvMetaForCanvas(canvas);
        if (csv) renderMetadataFromCsv(csv); else renderMetadataForCanvas(canvas);
        updateMetaVisibility();
        return;
      }
      return;
    }
    viewer.open(infoUrl);
    const csv = csvMetaForCanvas(canvas);
    if (csv) renderMetadataFromCsv(csv); else renderMetadataForCanvas(canvas);
    updateMetaVisibility();
  }

  function renderMetadata(metaArray) {
    const meta = document.getElementById('meta');
    meta.innerHTML = '';
    metaArray.forEach(entry => {
      const dt = document.createElement('dt');
      dt.textContent = getLang(entry.label);
      const dd = document.createElement('dd');
      // Value can be string or rich text; we render as plain text
      dd.textContent = Array.isArray(entry.value) ? getLang({ none: entry.value }) : getLang(entry.value);
      if (dt.textContent && dd.textContent) {
        meta.appendChild(dt); meta.appendChild(dd);
      }
    });
  }

  (function enableThumbsWheelScroll() {
  const el = document.getElementById('thumbs');
  if (!el) return;
  el.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
})();

  function renderMetadataForCanvas(canvas) {
    // Minimal: just the canvas label. If you store per-canvas metadata, add it here.
    const meta = document.getElementById('meta');
    const label = canvasLabel(canvas);
    if (!label) return;
    const dt = document.createElement('dt'); dt.textContent = 'Item';
    const dd = document.createElement('dd'); dd.textContent = label;
    // prepend
    const frag = document.createDocumentFragment();
    frag.appendChild(dt); frag.appendChild(dd);
    meta.prepend(frag);
  }

  loadManifest(MANIFEST_URL);

  });
