# winstall

## A web app for browsing Windows Package Manager apps, and create a batch-installation command using an intuitive interface.

How does it work?
-----------------------

winstall is powered by Windows Package Manager (aka "winget"), [Microsoft's new package manager](https://devblogs.microsoft.com/commandline/windows-package-manager-preview/) for Windows 10 and 11. it is available by default in Windows 10 and 11.

Installing Windows Package Manager
----------------------------------

If you don't already have Windows Package Manager, you can install it by downloading and installing the [latest .appxbundle file from here.](https://github.com/microsoft/winget-cli/releases)

Using winstall
--------------

To use winstall, you can search for apps on the homepage. Additionally, you can also view all the apps available via Windows Package Manager [on this page.](https://winstall.app//apps)

Simply select the apps you want to download and click on the "Generate Script" button at the bottom of the screen. You will then be presented with a command that you can copy and paste into any Windows command-line. Input that into a command line app of your choice, and hit enter to start installing the apps one-by-one using Windows Package Manager. You can also generate a PowerShell script by toggling the "Show Powershell scirpt" option.

Alternatively, you can click on the "Download .bat/.ps1" button which will download a batch file. However, you will likely get a security warning from your browser. In that case, ignore the warning as the batch file is completely secure. Once downloaded, you can double-click the .bat/ file to install the apps using the Windows Package Manager.

How is the data obtained?
-------------------------

winstall is powered by an API that I have built. The API regularly checks Microsoft's [official repository](https://github.com/microsoft/winget-pkgs) for Windows Package Manager apps. This means it always provides the latest data.

The API updates its data every 15 minutes on weekdays, and every 3 hours on weekends. I will be making the API open-source in the near-future.

Popular apps
------------

The list of popular apps are fetched from a `.json` file with a pre-populated set of data. On the front-end, a random selection of 6 apps from the list is displayed. If you would like to add an app to the list of popular apps, you can do so by [adding an app here](https://github.com/omaha-consulting/winstall/blob/master/data/popularApps.json) and creating a pull request. You will also have to provide a logo for that app, which needs to have a transparent image, be 80x80px, and in the .webp format. The logo must be [added in this folder.](https://github.com/omaha-consulting/winstall/tree/master/public/assets/apps). And because Safari does not like .webp, you need to also add a .png version of the same image under /apps/fallback.

History
------------
winstall was originally created by [Mehedi Hassan](https://github.com/MehediH) as a side project, and is now owned and maintained by Splashtop. Splashtop AEM automates your entire application lifecycle— from vendor and custom packaging to seamless continuous updates— saving time and reduce vulnerability risks.
