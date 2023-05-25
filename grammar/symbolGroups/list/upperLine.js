export default function upperLine({ content, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach(match => {
        const realPositions = { start: match.positions.start + addingDifference, end: match.positions.end + addingDifference };
        const brLength = match.md.substring(match.md.length - 4) === "<br>" ? 4 : 0;

        const cutContent = parsedContent.substring(realPositions.end + 1);
        
        const mdEnd = realPositions.end + 1 + cutContent.search("<br>") + brLength;
        const mdLine = parsedContent.substring(realPositions.end + 1, mdEnd);

        parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end - brLength) + tags.closed + parsedContent.substring(realPositions.end);
        addingDifference += tags.opened.length + tags.closed.length - brLength;

        removeMd({
            start: match.positions.end + 1 + addingDifference,
            end: match.positions.end + 1 + cutContent.search("<br>") + brLength + addingDifference
        }, mdLine.length);
    });

    function removeMd(positions, removeMdLine) {
        const removeMdContent = parsedContent.substring(positions.start, positions.end);
        
        let multipleLinesDifference = 0;
        if(removeMdContent.startsWith(">") || removeMdContent.startsWith("< ")) multipleLinesDifference = 1;
        
        parsedContent = parsedContent.substring(0, positions.start) + parsedContent.substring(positions.end + multipleLinesDifference);
        addingDifference -= removeMdLine + multipleLinesDifference;
    }

    return parsedContent;
}