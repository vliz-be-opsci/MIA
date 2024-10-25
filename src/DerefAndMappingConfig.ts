export default async function fetchderefconfig(path: string | null) {
  if (path === null) {
    console.error('deref-config attribute not found in script tag');
    return;
  }
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    //console.log(json);
    return json;
  } catch (error) {
    console.error("Error:", error);
  }
}