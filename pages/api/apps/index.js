// Mock API endpoint for testing - returns a list of apps
export default function handler(req, res) {
  const mockApps = [
    {
      _id: "7zip.7zip",
      name: "7-Zip",
      publisher: "Igor Pavlov",
      desc: "7-Zip is a file archiver with a high compression ratio.",
      icon: null,
      homepage: "https://www.7-zip.org/",
      latestVersion: "24.09",
      updatedAt: new Date().toISOString(),
      versions: [
        { version: "24.09", installers: ["https://example.com/7z2409-x64.exe"], installerType: "exe" },
        { version: "24.08", installers: ["https://example.com/7z2408-x64.exe"], installerType: "exe" },
        { version: "24.07", installers: ["https://example.com/7z2407-x64.exe"], installerType: "exe" },
        { version: "23.01", installers: ["https://example.com/7z2301-x64.exe"], installerType: "exe" },
      ],
      tags: ["archive", "compression", "zip", "7z"],
    },
    {
      _id: "Mozilla.Firefox",
      name: "Firefox",
      publisher: "Mozilla",
      desc: "Firefox is a free and open-source web browser developed by Mozilla.",
      icon: null,
      homepage: "https://www.mozilla.org/firefox/",
      latestVersion: "133.0",
      updatedAt: new Date().toISOString(),
      versions: [
        { version: "133.0", installers: ["https://example.com/firefox-133.exe"], installerType: "exe" },
        { version: "132.0", installers: ["https://example.com/firefox-132.exe"], installerType: "exe" },
        { version: "131.0", installers: ["https://example.com/firefox-131.exe"], installerType: "exe" },
      ],
      tags: ["browser", "web", "mozilla"],
    },
    {
      _id: "Microsoft.VisualStudioCode",
      name: "Visual Studio Code",
      publisher: "Microsoft",
      desc: "Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.",
      icon: null,
      homepage: "https://code.visualstudio.com/",
      latestVersion: "1.95.0",
      updatedAt: new Date().toISOString(),
      versions: [
        { version: "1.95.0", installers: ["https://example.com/vscode-1.95.exe"], installerType: "exe" },
        { version: "1.94.0", installers: ["https://example.com/vscode-1.94.exe"], installerType: "exe" },
        { version: "1.93.0", installers: ["https://example.com/vscode-1.93.exe"], installerType: "exe" },
      ],
      tags: ["editor", "code", "ide", "microsoft"],
    },
  ];

  res.status(200).json(mockApps);
}
