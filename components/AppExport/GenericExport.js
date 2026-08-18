import { useState, useEffect } from 'react';
import { FiCopy, FiDownload, FiInfo } from "react-icons/fi";
import styles from "../../styles/exportApps.module.scss";

let handleCopy = ( fileContent, setCopyText ) => {
    navigator.clipboard.writeText(fileContent).then(() => {
        if(setCopyText) setCopyText("Copied!")
    }).catch(() => {
        document.querySelector("textarea").select();
    })
}

let handleDownload = ( fileContent, fileExtension, downloadId ) => {
    let dl = document.querySelector("#gsc");
    dl.setAttribute("download", `winstall-${downloadId}${fileExtension}`)
    dl.href = "data:text/plain;base64," + btoa(fileContent);
    dl.click();
}

const GenericExport = ({ fileContent, displayedCommand, fileExtension, prioritiseDownload=false, tip, onExportDownload }) => {
    const [copyText, setCopyText] = useState("Copy to clipboard");
    const [textboxContent, setTextboxContent] = useState();
    const [downloadId, setDownloadId] = useState(Math.floor(1000 + Math.random() * 9000));

    useEffect(() => {
        setCopyText("Copy to clipboard");

        setTextboxContent(displayedCommand ? displayedCommand.replace("$fileName", `winstall-${downloadId}.json`) : fileContent);
    }, [fileContent, displayedCommand, downloadId])

    return (
        <div className={styles.generate}>
            <textarea
                value={ textboxContent }
                readOnly
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                spellCheck={false}
                data-gramm_editor={false} // disable grammarly from showing up
            />

            { tip && (
                <div className={styles.tipContainer}>
                    <FiInfo/>
                    <p>{tip}</p>
                </div>
            )}

            <div className={`box`}>
                { !prioritiseDownload && (
                    <button className={`button accent`} onClick={() => {
                        handleCopy(textboxContent, setCopyText);
                        if (typeof onExportDownload === "function") onExportDownload();
                    }}>
                        <FiCopy />
                        {copyText}
                    </button>
                )}

                <button className={`button dl ${prioritiseDownload ? 'accent' : ''}`}  onClick={() => {
                    handleDownload(fileContent, fileExtension, downloadId);

                    if(prioritiseDownload){
                        handleCopy(textboxContent);
                    }

                    if (typeof onExportDownload === "function") onExportDownload();
                }}>
                    <FiDownload />
                    Download {fileExtension} {prioritiseDownload ? " + Copy to clipboard" : ""}
                </button>
            </div>
        </div>
    )
}

export default GenericExport;