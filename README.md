# contact-foundry

A browser-based contact generator that converts phone lists into numbered VCF files, with editing, deleting, archiving, downloading, and sharing.

Everything runs client-side (no server or database) — exports are kept in the browser's `localStorage` and files are generated on the fly as downloadable/shareable `.vcf` blobs, so it works as a static site (e.g. GitHub Pages) with no backend.

## Usage
1. Open `index.html`.
2. Enter a base name and paste your phone numbers (one per line, or comma/semicolon-separated).
3. Click **Generate and save VCF** — the file downloads and is added to the archive below.
4. From the archive you can **Download**, **Share** (via the OS share sheet, where supported), or **Edit list** any past export.
