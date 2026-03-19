export const callTwitterAPI = async (endpoint, method="GET") => {
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