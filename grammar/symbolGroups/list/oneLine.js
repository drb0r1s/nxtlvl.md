import Convert from "../../../functions/Convert.js";

export default function oneLine({ content, symbol, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    if(symbol.tag === "pre") console.log(Convert.toASCII("NXTLVL.md"))

    matches.forEach(match => {
        const realPositions = { start: match.positions.start + addingDifference, end: match.positions.end + addingDifference };
        const brLength = match.md.substring(match.md.length - 4) === "<br>" ? 4 : 0;

        parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end - brLength) + tags.closed + parsedContent.substring(realPositions.end);
        addingDifference += tags.opened.length + tags.closed.length - brLength;
    });

    const pattern = `(?<=((>\\s*|<\\s+)${tags.opened}|^${tags.opened}))${symbol.md}\\s+`;
    const removeMd = new RegExp(pattern, "gm");

    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}