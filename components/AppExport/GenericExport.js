import { useState, useEffect } from "react";
import { FiCopy, FiDownload, FiInfo } from "react-icons/fi";
import styles from "../../styles/exportApps.module.scss";

function copyText(text, onDone) {
    navigator.clipboard.writeText(text).then(() => {
        if (onDone) onDone();
    }).catch(() => {
        const el = document.createElement("textarea");
        el.value = text;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand("copy");
            if (onDone) onDone();
        } finally {
            document.body.removeChild(el);
        }
    });
}

function downloadTextFile(fileContent, fileName) {
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function splitScriptLines(script, fileExtension) {
    if (!script) return [];
    if (fileExtension === ".bat") return script.split(" && ");
    if (fileExtension === ".ps1") return script.split(" ; ");
    return [script];
}

function CommandLine({ command, joiner }) {
    const idMatch = command.match(/^(winget install --id=)(\S+)(.*)$/);
    const importMatch = command.match(/^(winget import --import-file )(.+)$/);

    let body = command;
    if (idMatch) {
        body = (
            <>
                {idMatch[1]}
                <span className={styles.commandId}>{idMatch[2]}</span>
                {idMatch[3] ? <span className={styles.commandFlag}>{idMatch[3]}</span> : null}
            </>
        );
    } else if (importMatch) {
        body = (
            <>
                {importMatch[1]}
                <span className={styles.commandId}>{importMatch[2]}</span>
            </>
        );
    }

    return (
        <span className={styles.commandLine}>
            {body}
            {joiner ? <span className={styles.commandOp}> {joiner}</span> : null}
        </span>
    );
}

const GenericExport = ({
    fileContent,
    displayedCommand,
    fileExtension,
    prioritiseDownload = false,
    tip,
    onExportDownload,
}) => {
    const [copyTextLabel, setCopyTextLabel] = useState("Copy");
    const [copyCommand, setCopyCommand] = useState("");
    const [downloadId, setDownloadId] = useState(Math.floor(1000 + Math.random() * 9000));

    useEffect(() => {
        setCopyTextLabel(prioritiseDownload ? "Download .json + Copy to clipboard" : "Copy");
        setCopyCommand(
            displayedCommand
                ? displayedCommand.replace("$fileName", `winstall-${downloadId}.json`)
                : fileContent
        );
    }, [fileContent, displayedCommand, downloadId, prioritiseDownload]);

    const joiner = fileExtension === ".bat" ? "&&" : fileExtension === ".ps1" ? ";" : "";
    const displaySource = displayedCommand ? copyCommand : fileContent;
    const lines = splitScriptLines(displaySource, displayedCommand ? "" : fileExtension);

    const reportExport = () => {
        if (typeof onExportDownload === "function") onExportDownload();
    };

    const handleCopy = () => {
        copyText(copyCommand, () => {
            setCopyTextLabel("Copied!");
            setTimeout(() => {
                setCopyTextLabel(prioritiseDownload ? "Download .json + Copy to clipboard" : "Copy");
            }, 1600);
        });
        reportExport();
    };

    const handleDownload = () => {
        downloadTextFile(fileContent, `winstall-${downloadId}${fileExtension}`);
        if (prioritiseDownload) {
            copyText(copyCommand);
        }
        reportExport();
    };

    return (
        <div className={styles.exportBlock}>
            <div className={styles.commandBox}>
                {lines.map((line, index) => (
                    <CommandLine
                        key={`${line}-${index}`}
                        command={line}
                        joiner={joiner && index < lines.length - 1 ? joiner : ""}
                    />
                ))}
            </div>

            {tip && (
                <div className={styles.tipContainer}>
                    <FiInfo />
                    <p>{tip}</p>
                </div>
            )}

            <div className={styles.exportActions}>
                {prioritiseDownload ? (
                    <button
                        type="button"
                        className="button accent"
                        onClick={handleDownload}
                    >
                        <FiDownload />
                        Download {fileExtension} + Copy to clipboard
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            className="button accent"
                            onClick={handleCopy}
                        >
                            <FiCopy />
                            {copyTextLabel}
                        </button>
                        <button
                            type="button"
                            className="button"
                            onClick={handleDownload}
                        >
                            <FiDownload />
                            Download {fileExtension}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GenericExport;
