export default function upperLine({ content, symbol, matches, tags }) {
    let parsedContent = content;
    let addingDifference = 0;

    console.log(matches)

    matches.forEach(match => {
        const tag = `${tags.opened}${match.md}${tags.closed}{delete}`;
        const realPosition = match.position + addingDifference;

        parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
        addingDifference += tag.length;
    });

    const matchesPattern = "{delete}.+(?=<br>)";
    const removeMatches = new RegExp(matchesPattern, "gm");

    parsedContent = parsedContent.replace(removeMatches, "");

    const pattern = `(?<=.+<br>\\n)^${symbol.md}+<br>`;
    const removeMd = new RegExp(pattern, "gm");

    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}