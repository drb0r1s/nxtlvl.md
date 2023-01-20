export default function upperLine({ content, symbol, matches }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach(match => {
        const tag = `<${symbol.tag}>${match.md}</${symbol.tag}>{delete}`;
        const realPosition = match.position + addingDifference;

        parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
        addingDifference += tag.length;
    });

    const matchesPattern = "{delete}.+";
    const removeMatches = new RegExp(matchesPattern, "gm");

    parsedContent = parsedContent.replace(removeMatches, "");

    const pattern = `^${symbol.md}{1,}(?=<br>)`;
    const removeMd = new RegExp(pattern, "gm");
    
    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}