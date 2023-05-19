export default function isLineEmpty(line) {
    let result = true;
    const brLength = line.substring(line.length - 4) === "<br>" ? 4 : 0;

    for(let i = 0; i < line.length - brLength; i++) if(line[i] !== " ") result = false;

    return result;
}