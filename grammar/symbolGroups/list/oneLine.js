export default function oneLine({ content, symbol, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach((match, index) => {
        const tag = index % 2 === 0 ? tags.opened : tags.closed;
        const realPosition = match.position + addingDifference;

        parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
        addingDifference += tag.length;
    });

    const pattern = `(?<=((>\\s*|<\\s+)${tags.opened}|^${tags.opened}))${symbol.md}+\\s*`;
    const removeMd = new RegExp(pattern, "gm");

    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}