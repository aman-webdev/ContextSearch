const checkIfValidURL = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}

export default checkIfValidURL