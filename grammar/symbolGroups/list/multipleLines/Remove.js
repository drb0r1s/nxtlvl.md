const Remove = { md, fakeMd, lastBr, details };
export default Remove;

function md(content, symbol, isSpecial) {
    let newContent = content;
    
    if(isSpecial) {
        const { specialPattern } = getPatterns();
        newContent = newContent.replaceAll(specialPattern, "");
    }

    else {
        const { pattern } = getPatterns();
        newContent = newContent.replace(pattern, "");
    }

    return newContent;

    function getPatterns() {
        const patterns = { classic: "", special: "" };

        switch(symbol.tag) {
            case "blockquote":
                patterns.classic = /(?<=(^[<\s]*|<blockquote class=".+">))((>\s+(?=[<>]))|>)/;
                patterns.special = /((?<=<blockquote class=".+">)\(>\s*<br>)|((?<=<\/blockquote>)>\)\s*<br>)/gm;
                break;
            case "details":
                patterns.classic = /(?<=(^[>\s]*|<details class=".+">))((<\s+(?=[<>]))|<\s)/;
                patterns.special = /((?<=<details class=".+">)\(<\s*<br>)|((?<=<\/details>)<\)\s*<br>)/gm;
                break;
            case "ol":
            case "ul":
                const listPatterns = { ol: /^[<>\s]*[0-9]+\.\s(?!\s*<br>)/, ul: /^[<>\s]*[*+-]\s(?!\s*<br>)/ };

                const specialListPatterns = {
                    ol: /((?<=<ol class=".+">)\([0-9]+\.\s*<br>)|((?<=<\/ol>)[0-9]+\.\)\s*<br>)/gm,
                    ul: /((?<=<ul class=".+">)\([*+-]\s*<br>)|((?<=<\/ul>)[*+-]\)\s*<br>)/gm
                };

                patterns.classic = symbol.tag === "ol" ? listPatterns.ol : listPatterns.ul;
                patterns.special = symbol.tag === "ol" ? specialListPatterns.ol : specialListPatterns.ul;
                break;
            default: ;
        }

        return { pattern: patterns.classic, specialPattern: patterns.special };
    }
}

function fakeMd(content, symbol) {
    let newContent = content;
    let pattern = "";
    
    switch(symbol.tag) {
        case "blockquote":
            pattern = /((?<=<blockquote.+">)>|^>)(?=[\s>]*<br>)/gm;
            break;
        case "details":
            pattern = /((?<=<details.+">)<(?=\s)|^<(?=\s))(?=[\s<]*<br>)|(?<=^\()<(?=\s*<br>)|^<(?=\)\s*<br>)/gm;
            break;
        default: ;
    }

    if(!pattern) return newContent;

    const replaceWith = symbol.tag === "blockquote" ? "&gt;" : "&lt;"
    newContent = newContent.replaceAll(pattern, replaceWith);

    return newContent;
}

function lastBr(content) {
    let newContent = content;

    const regex = /<br>(?=<\/(blockquote|details|summary|ol|ul|li)>)/gm;
    newContent = newContent.replaceAll(regex, "");

    return newContent;
}

function details(match) {
    const newMatch = match;

    const length = { prev: newMatch.md.length, current: -1 };

    const brPosition = newMatch.md.indexOf("<br>");
    newMatch.md = newMatch.md.substring(0, brPosition + 4);

    length.current = newMatch.md.length;

    const lengthDifference = length.prev - length.current;
    newMatch.positions.end -= lengthDifference;

    return newMatch;
}