export default function classic({ content, pattern, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;
    
    matches.forEach((match, index) => {
        const tag = index % 2 === 0 ? tags.opened : tags.closed;
        const realPosition = match.positions.start + addingDifference;

        parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
        addingDifference += tag.length;
    });

    const regex = new RegExp(pattern, "gm");
    parsedContent = parsedContent.replace(regex, "");

    return parsedContent;
}