import uniqid from "uniqid";

export default function generatePlayerObject(name, sign, ai = false, client = false) {
    return {
        id: uniqid(),
        name,
        sign,
        ai,
        client,
    };
}
