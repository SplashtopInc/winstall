// Mock API endpoint for testing - returns a single app by ID
export default function handler(req, res) {
  const { id } = req.query;

  const mockApps = {
    "7zip.7zip": {
      _id: "7zip.7zip",
      name: "7-Zip",
      publisher: "Igor Pavlov",
      desc: "7-Zip is a file archiver with a high compression ratio. It supports packing and unpacking various archive formats including 7z, ZIP, GZIP, BZIP2, TAR, and more. The software features a high compression ratio in 7z format, strong AES-256 encryption, self-extracting capability, and integration with Windows Shell.",
      icon: null,
      homepage: "https://www.7-zip.org/",
      latestVersion: "24.09",
      updatedAt: new Date().toISOString(),
      license: "LGPL-2.1",
      licenseUrl: "https://www.7-zip.org/license.txt",
      versions: [
        { version: "24.09", installers: ["https://example.com/7z2409-x64.exe"], installerType: "exe" },
        { version: "24.08", installers: ["https://example.com/7z2408-x64.exe"], installerType: "exe" },
        { version: "24.07", installers: ["https://example.com/7z2407-x64.exe"], installerType: "exe" },
        { version: "23.01", installers: ["https://example.com/7z2301-x64.exe"], installerType: "exe" },
      ],
      tags: ["archive", "compression", "zip", "7z", "utility"],
    },
    "Mozilla.Firefox": {
      _id: "Mozilla.Firefox",
      name: "Firefox",
      publisher: "Mozilla",
      desc: "Firefox is a free and open-source web browser developed by Mozilla. It uses the Gecko rendering engine to display web pages, which implements current and anticipated web standards. Firefox includes tabbed browsing, spell checking, incremental find, live bookmarking, and a download manager.",
      icon: null,
      homepage: "https://www.mozilla.org/firefox/",
      latestVersion: "133.0",
      updatedAt: new Date().toISOString(),
      license: "MPL-2.0",
      licenseUrl: "https://www.mozilla.org/MPL/2.0/",
      versions: [
        { version: "133.0", installers: ["https://example.com/firefox-133.exe"], installerType: "exe" },
        { version: "132.0", installers: ["https://example.com/firefox-132.exe"], installerType: "exe" },
        { version: "131.0", installers: ["https://example.com/firefox-131.exe"], installerType: "exe" },
      ],
      tags: ["browser", "web", "mozilla", "internet"],
    },
    "Microsoft.VisualStudioCode": {
      _id: "Microsoft.VisualStudioCode",
      name: "Visual Studio Code",
      publisher: "Microsoft",
      desc: "Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications. It is free and built on open source. It features IntelliSense, debugging, built-in Git support, and thousands of extensions.",
      icon: null,
      homepage: "https://code.visualstudio.com/",
      latestVersion: "1.95.0",
      updatedAt: new Date().toISOString(),
      license: "MIT",
      licenseUrl: "https://code.visualstudio.com/license",
      versions: [
        { version: "1.95.0", installers: ["https://example.com/vscode-1.95.exe"], installerType: "exe" },
        { version: "1.94.0", installers: ["https://example.com/vscode-1.94.exe"], installerType: "exe" },
        { version: "1.93.0", installers: ["https://example.com/vscode-1.93.exe"], installerType: "exe" },
      ],
      tags: ["editor", "code", "ide", "microsoft", "development"],
    },
  };

  const app = mockApps[id];

  if (!app) {
    res.status(404).json({ error: "App not found" });
    return;
  }

  res.status(200).json(app);
}
