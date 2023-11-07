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
    response.status(404);
};

router.get("/book/:id", async (req, res) => {
    const repository = useLilithLoader();
    const { id } = req.params;
    handleRepoErrors(repository.get(id), res);
});

router.get("/search", async (req, res) => {
    const { query, page, sort } = req.query;

    if (!query || typeof query !== "string" || typeof page !== "string") {
        res.status(404).json();
        return;
    }

    const repository = useLilithLoader();
    handleRepoErrors(repository.search(query, +(page || 1), sort as Sort), res);
});

router.get("/paginate/:page", async (req, res) => {
    const { page } = req.params;
    const repository = useLilithLoader();
    handleRepoErrors(repository.paginate(parseInt(page)), res);
});

router.get("/random", async (req, res) => {
    const repository = useLilithLoader();
    handleRepoErrors(repository.random(), res);
});

export default router;
