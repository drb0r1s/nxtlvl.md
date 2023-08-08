export default function checkAllowedEmptyContent(content, symbol) {
    if(content === undefined || (symbol.tag !== "blockquote" && symbol.tag !== "details")) return false;

    let status = true;

    const md = symbol.tag === "blockquote" ? ">" : "<";
    const brLength = content.substring(content.length - 4) === "<br>" ? 4 : 0;

    for(let i = 0; i < content.length - brLength; i++) if(content[i] !== " " && content[i] !== md) status = false;
    return status;
}