export async function fetchEntity(uri) {
    let data;
    const response = await fetch(uri + ".json");
    if (response.ok) {
        data = await response.json();
        return data;

    } else {
        throw new Error('Could not load entity');
    }
}
