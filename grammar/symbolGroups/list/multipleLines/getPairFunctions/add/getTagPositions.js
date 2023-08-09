export default function getTagPositions(tag, content) {
    const positions = { start: -1, end: -1 };

    const tagStartPattern = `${tag} class="nxtlvl multiple-lines`;
    const tagStartRegex = new RegExp(tagStartPattern);

    const tagStartMatch = content.match(tagStartRegex);

    if(tagStartMatch) {
        positions.start = tagStartMatch.index;

        const beforeStartLength = content.substring(0, positions.start).length;
        const afterStart = content.substring(positions.start);
        
        positions.end = beforeStartLength + afterStart.indexOf("\">") + 2;
    }

    else return false;

    return positions;
}