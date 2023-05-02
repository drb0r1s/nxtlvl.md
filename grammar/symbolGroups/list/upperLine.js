export default function upperLine({ content, symbol, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach(match => {
        const realPositions = { start: match.position + addingDifference, end: match.position + match.md.length + addingDifference };
        const removeBr = match.md.substring(match.md.length - 4) === "<br>" ? 4 : 0;

        parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end - removeBr) + tags.closed + parsedContent.substring(realPositions.end);
        addingDifference += tags.opened.length + tags.closed.length - removeBr;

        removeMd(realPositions.end + addingDifference);
    });

    function removeMd(realPositionEnd) {
        const cutContent = parsedContent.substring(realPositionEnd);
        const mdEnd = realPositionEnd + cutContent.search("<br>") + 4;

        parsedContent = parsedContent.substring(0, realPositionEnd) + parsedContent.substring(mdEnd);
        addingDifference -= mdEnd;
    }

    /*const matchesPattern = "{delete}.+(?=<br>)";
    const removeMatches = new RegExp(matchesPattern, "gm");

    parsedContent = parsedContent.replace(removeMatches, "");

    const pattern = `(?<=.+<br>\\n)^${symbol.md}+<br>`;
    const removeMd = new RegExp(pattern, "gm");

    parsedContent = parsedContent.replace(removeMd, "");*/

    return parsedContent;
}