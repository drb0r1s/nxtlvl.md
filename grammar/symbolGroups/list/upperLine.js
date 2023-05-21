export default function upperLine({ content, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach(match => {
        const realPositions = { start: match.positions.start + addingDifference, end: match.positions.end + addingDifference };
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

    return parsedContent;
}