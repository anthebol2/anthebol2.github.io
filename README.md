# Portfolio publishing files

Static publishing files for https://anthebol2.github.io/.

This repository contains the built website. Development source is maintained
separately. Update this repository using the validated output from
`python3 scripts/build_pages.py` in the development checkout.

GitHub Pages should publish the root of the `main` branch. The `.nojekyll` file
keeps the HTML, CSS, JavaScript, and assets unchanged.

For a local preview, run `python3 -m http.server 8001 --bind 127.0.0.1` in this
directory and open http://localhost:8001/.

Pages request `noindex`; this discourages search indexing but does not restrict
access. This publishing repository and the deployed site are publicly viewable.

To take the website offline, use Settings → Pages → Unpublish site.
