import {
    Sort,
    Book,
    SearchResult,
    Pagination,
    useAPILoader,
    LilithRepo,
} from "@atsu/lilith";

const handleLilithErrors = <T>(req: Promise<T>): Promise<T | null> =>
    req.catch((err) => {
        console.error(err);
        return null;
    });

export const useLilithLoader = () => {
    const lilithLoader = useAPILoader({
        repo: LilithRepo.NHentai,
        configurations: {},
    });

    const get = async (identifier: string): Promise<Book | null> => {
        return await handleLilithErrors(lilithLoader.get(identifier));
    };

    const search = async (
        query: string,
        page: number,
        sort: Sort,
    ): Promise<SearchResult | null> => {
        return await handleLilithErrors(lilithLoader.search(query, page, sort));
    };

    const paginate = async (page: number): Promise<Pagination | null> => {
        return await handleLilithErrors(lilithLoader.paginate(page));
    };

    const random = async (retry?: number): Promise<Book | null> => {
        return await handleLilithErrors(lilithLoader.random(retry));
    };

    return {
        get,
        search,
        paginate,
        random,
    };
};
