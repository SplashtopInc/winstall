import styles from "../../styles/exportApps.module.scss";

export const CheckboxConfig = ({ id, defaultChecked, updateConfig, hiddenOptions, labelText, disabled = false }) => {
    if(hiddenOptions.includes(id)) return null;

    return (
        <label htmlFor={id} className={disabled ? styles.disabled : ''}>
            <input type="checkbox" id={id} checked={defaultChecked} onChange={(e) => updateConfig(id, e.target.checked)} disabled={disabled}/>
            <p>{labelText} <code>{id}</code></p>
        </label>
    )
}

export const RadioConfig = ({ id, defaultChecked, options, updateConfig, hiddenOptions, labelText, disabled = false, groupId }) => {
    if(hiddenOptions.includes(id)) return null;

    const radioName = groupId || id;

    return (
        <label className={`${styles.radioContainer} ${disabled ? styles.disabled : ''}`}>
            <p>{labelText} <code>{id}</code></p>

            <div>
                { options.map((option) => {
                    const optionId = `${radioName}-${option.id || 'default'}`;

                    return (
                        <label key={option.id} htmlFor={optionId}>
                            <input type="radio" id={optionId} name={radioName} value={option.id} onChange={(e) => updateConfig(id, e.target.value)} checked={defaultChecked === option.id} disabled={disabled}/>
                            <p>{option.label}</p>
                        </label>
                    )
                })}
            </div>
        </label>
    )
}

export const TextInputConfig = ({ id, defaultValue, updateConfig, hiddenOptions, labelText, inputPlaceholder }) => {
    if(hiddenOptions.includes(id)) return null;

    return (
        <label htmlFor={id} className={styles.text}>
            <p>{labelText} <code>{id}</code></p>
            <input type="text" id={id} value={defaultValue} onChange={(e) => updateConfig(id, e.target.value)} placeholder={inputPlaceholder}/>
        </label>
    )
}