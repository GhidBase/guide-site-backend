async function index(req, res) {
    console.log("pages request received");
    res.send("pages");
}

async function postPage(req, res) {
    console.log("create page request received");
    res.send("pages create");
}

export default {
    index,
    postPage
};
