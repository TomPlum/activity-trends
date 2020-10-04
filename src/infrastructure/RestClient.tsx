import fetch from 'isomorphic-unfetch';

class RestClient {
    private static readonly host = process.env.BACKEND_URL

    static get = (endpoint: string) => RestClient.makeRestRequest("GET", undefined, endpoint);

    static post = (endpoint: string, body: {}) => RestClient.makeRestRequest("POST", body, endpoint);
    

    private static async makeRestRequest(method: string, body: object, endpoint: string) {
        if (!this.host) {
            throw new ReferenceError('Host URI is not defined!');
        }

        if (!endpoint) {
            throw new ReferenceError("Endpoint is not defined!");
        }

        const URI = this.host + endpoint;
        console.log("Sending " + method + " request to " + URI);

        return await fetch(URI, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            //body: body ? JSON.stringify(body) : undefined
        }).then(response => {
            const json = response.json()
            console.log("Received JSON response:", json);
            return json;
        }).catch(e => {
            console.log("An error occurred while making a request to " + endpoint, e);
            return undefined;
        });
    }
}

export default RestClient;