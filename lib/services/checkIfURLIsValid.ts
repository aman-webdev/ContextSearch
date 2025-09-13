const checkIfValidURL = (urlString: string): boolean => {
    try {
        new URL(urlString);
        return true;
    } catch (err) {
        return false;
    }
}

export default checkIfValidURL