import Convert from "./Convert.js";

export default function generateTags(symbol) {
    const clearMd = symbol.md.replace(/\\+/g, "");

    const classes = {
        group: Convert.camelToKebab(symbol.group),
        tag: symbol.tag,
        md: clearMd
    };

    const classContent = `${classes.group} ${classes.tag} ${classes.md}`;
    
    const tags = { opened: `<${symbol.tag} class="${classContent}">`, closed: `</${symbol.tag}>` };

    return tags;
}