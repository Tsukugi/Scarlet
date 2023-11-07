import express from "express";
import { useLilithLoader } from "./repo";
import { Sort } from "@atsu/lilith";

const router = express.Router();

const handleRepoErrors = async <T, R extends express.Response>(
    request: Promise<T | null>,
    response: R,
): Promise<void> => {
    const result = await request;

    if (result) {
        response.json(result);
        return;
    }
    response.status(404).json({ error: "Resource not found" });
};

const useLoader = (req: express.Request) => {
    const userAgent = req.get("local-agent") || ""; // Accessing User-Agent header
    const cookie = req.get("local-cookie") || ""; // Accessing cookie header (note: it's case-sensitive)

    const repository = useLilithLoader({ "User-Agent": userAgent, cookie });

    return repository;
};

router.get("/test", async (req, res) => {
    const repository = useLoader(req);
    try {
        await repository.get("480154");
    } catch (err) {
        console.error(err);
        res.status(403).json({ result: null });
    }
});

router.get("/book/:id", async (req, res) => {
    const repository = useLoader(req);
    const { id } = req.params;
    handleRepoErrors(repository.get(id), res);
});

router.get("/search", async (req, res) => {
    const { query, page, sort } = req.query;

    if (!query || typeof query !== "string" || typeof page !== "string") {
        res.status(404).json({ error: "Resource not found" });
        return;
    }

    const repository = useLoader(req);
    handleRepoErrors(repository.search(query, +(page || 1), sort as Sort), res);
});

router.get("/paginate/:page", async (req, res) => {
    const { page } = req.params;
    const repository = useLoader(req);
    handleRepoErrors(repository.paginate(parseInt(page)), res);
});

router.get("/random", async (req, res) => {
    const repository = useLoader(req);
    handleRepoErrors(repository.random(), res);
});

export default router;
