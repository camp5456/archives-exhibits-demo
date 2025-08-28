---
layout: building-research
title: Building Research Overview
permalink: /building-research.html
show_banner: true
---

<style>
#my-mirador {
  height: 700px;
  max-width: 90%;
  margin: 2rem auto;
  position: relative;
  border: 1px solid #ccc;
}
</style>

<div class="body-container-building-research">

<h1 id="page-menu-label" class="section-title"></h1>

<p>In 1904, astrophysicist George Ellery Hale moved to Pasadena to found and direct Mount Wilson Observatory. Three years later, he joined Throop Polytechnic Institute’s board of trustees and began to reinvent the institution. “It would be far better to do some one thing extremely well than to teach such a variety of subjects in a mediocre way,” wrote Hale, and that one thing was to be engineering. Hale recruited a new president, James Scherer, under whom the school shed courses to focus on mechanical and electrical engineering. In another narrowing, in 1910 Scherer stopped admitting women as students, a policy the Institute would reverse for graduate students in 1953 and for undergraduates in 1970.</p>

<p>In 1910, Throop also moved to a new campus, where Caltech still stands today. Local architects Myron Hunt and Elmer Grey designed the first plans for the campus and its first building, Pasadena Hall. Later, Hale was impressed by the Spanish Colonial Revival style that New York architect Bertram Goodhue developed for the 1915 Panama-California Exposition in San Diego’s Balboa Park; he persuaded the Throop trustees to hire Goodhue, whose vision for the campus would guide its development for decades to come.</p>

<p>World War I catalyzed Throop’s next transformation. An advocate of “patriotic preparedness,” Scherer added military training to the curriculum. Meanwhile, Hale organized the National Research Council in Washington, bringing scientists together to pursue research on subjects relevant to the war. In addition to Hale, its leaders included chemist Arthur Amos Noyes and physicist Robert Millikan, both of whom would permanently join a growing Throop after the war.</p>

</div>


<script src="https://unpkg.com/mirador@3.3.0/dist/mirador.min.js"></script>
<div id="my-mirador"></div>
<script type="text/javascript">
  // Get base URL using Liquid, rendered as a string
  const baseUrl = "{{ site.baseurl | default: '' }}";

  window.miradorInstance = Mirador.viewer({
    id: "my-mirador",
    manifests: {
      [baseUrl + "/objects/greater-throop-collection/manifest.json"]: {
        provider: "Caltech Library"
      }
    },
    windows: [{
      loadedManifest: baseUrl + "/objects/greater-throop-collection/manifest.json",
      canvasIndex: 0,
      thumbnailNavigationPosition: "far-bottom",
      view: "single",
      osdBounds: {
        x: 0,
        y: 0,
        width: 5442,
        height: 7299
      }
    }],
    workspaceControlPanel: {
      enabled: false
    },
    window: {
      osdOptions: {
        homePosition: null,
        defaultZoomLevel: 0,
        preserveViewport: false,
        animationTime: 0.5,
        fitBounds: true,
        visibilityRatio: 1.0,
        immediateRender: true,
        minZoomLevel: 0,
        maxZoomLevel: 10
      }
    }
  });
</script>