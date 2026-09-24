import { getPinnedInstallVersion } from "./installVersion";

// schema from https://raw.githubusercontent.com/microsoft/winget-cli/master/schemas/JSON/packages/packages.schema.1.0.json

let wingetImportSchema = {
	"$schema": "https://aka.ms/winget-packages.schema.1.0.json",
    "WinGetVersion": "0.3.11201",
	"Sources": [
		{
			"Packages": [
                // we just need to populate this
            ],
			"SourceDetails": {
				"Argument" : "https://winget.azureedge.net/cache",
				"Identifier" : "Microsoft.Winget.Source_8wekyb3d8bbwe",
				"Name" : "winget",
				"Type" : "Microsoft.PreIndexed.Package"
			}
		}
	]
}

const generateWingetImport = async (apps) => {
    const packages = [];

    await apps.map(app => {
        const individualPackage = {
            "Id": app._id,
        }

        const pinnedVersion = getPinnedInstallVersion(app);
        if (pinnedVersion) {
            individualPackage.Version = pinnedVersion;
        }

        packages.push(individualPackage);
    })

    wingetImportSchema.Sources[0].Packages = packages;

    return wingetImportSchema;
}

export default generateWingetImport;
