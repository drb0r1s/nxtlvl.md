import escapeRegex from "./escapeRegex.js";

const Match = { all, closest };
export default Match;

function all(content, match) {
    const matches = [...content.matchAll(match)];
    
    const formattedMatches = [];
    matches.forEach(match => formattedMatches.push({ content: match[0], positions: { start: match.index, end: match.index + match[0].length } }));

    return formattedMatches;
}

function closest(content, match, originalMatchPosition) {
    const matches = all(content, escapeRegex(match));
    let closestMatch = matches[0];

    if(matches.length > 1) for(let i = 1; i < matches.length; i++) {
        const difference = Math.abs(originalMatchPosition - matches[i].positions.start);
        const currentDifference = Math.abs(originalMatchPosition - closestMatch.positions.start);

        if(difference < currentDifference) closestMatch = matches[i];
        else if((originalMatchPosition > closestMatch.positions.start) && (originalMatchPosition < matches[i].positions.start)) closestMatch = matches[i];
    }

    return closestMatch;
}