export default function upperLine(content, symbol) {
    let parsedContent = content;

    const matches = parsedContent.match(symbol.pattern) || [];
    
    matches.forEach(match => parsedContent = parsedContent.replace(match, `<${symbol.tag}>${match}</${symbol.tag}>`));

    //parsedContent = parsedContent.replace(/^(=|-){1,}/gm, "");
    const regex = new RegExp(`^${matches[0][0]}{1,}`, "gm");
    console.log(regex)
    parsedContent = parsedContent.replace(regex, "")

    return parsedContent;
}