import Convert from "../../../functions/Convert.js";

export default function oneLine({ content, symbol, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach(match => {
        const realPositions = { start: match.positions.start + addingDifference, end: match.positions.end + addingDifference };
        const brLength = match.md.substring(match.md.length - 4) === "<br>" ? 4 : 0;

        const asciiCase = symbol.tag === "pre" ? Convert.toASCII(parsedContent.substring(realPositions.start + 2, realPositions.end - brLength)) : "";
        const innerContent = asciiCase ? asciiCase : parsedContent.substring(realPositions.start, realPositions.end - brLength);

        parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + innerContent + tags.closed + parsedContent.substring(realPositions.end);
        addingDifference += tags.opened.length + tags.closed.length - brLength + (asciiCase ? innerContent.length : 0);
    });

    const pattern = `(?<=((>\\s*|<\\s+)${tags.opened}|^${tags.opened}))${symbol.md}\\s+`;
    const removeMd = new RegExp(pattern, "gm");

    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}