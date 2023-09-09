export default function isSpecial(content) {
    const symbols = "(>|<|[0-9]+\\.|[*+-])";
    const pattern = `(?<=^\\()${symbols}(?=\\s*<br>)|^${symbols}(?=\\)\\s*<br>)`;

    const regex = new RegExp(pattern);
    const match = content.match(regex);

    const result = match ? match[0] : false;
    return result;
}