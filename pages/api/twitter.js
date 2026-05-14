const ALLOWED_TWITTER_HOSTS = ['api.twitter.com', 'api.x.com'];
const ALLOWED_TWITTER_PATHS = [
    '/2/tweets',
    '/2/users',
    '/2/search/recent',
    '/2/tweets/search/recent',
    '/1.1/statuses',
    '/1.1/users'
];

const isAllowedEndpoint = (url) => {
    try {
        const parsed = new URL(url);
        const isAllowedHost = ALLOWED_TWITTER_HOSTS.includes(parsed.hostname);
        const isAllowedPath = ALLOWED_TWITTER_PATHS.some(path => parsed.pathname.startsWith(path));
        return isAllowedHost && isAllowedPath;
    } catch {
        return false;
    }
};

export const callTwitterAPI = async (endpoint, method="GET") => {
    if (!isAllowedEndpoint(endpoint)) {
        return { response: null, error: 'Invalid or disallowed endpoint' };
    }

    let response, error;

    try {
        const res = await fetch(endpoint, {
            method: method,
            headers: {
                "Authorization": `Bearer ${process.env.TWITTER_BEARER}`
            }
        });

        if(res.status !== 200) {
            error = await res.json();
        } else{
            response = await res.json();
        }
    } catch(err){
        error = err.message;
    }

    return { response, error }
}

export default async function handler(req, res) {
    const { response, error } = await callTwitterAPI(req.headers.endpoint, req.method);

    return res.send({ response, error });
}