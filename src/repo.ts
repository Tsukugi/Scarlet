import * as fetch from "node-fetch";
import {
    Sort,
    Book,
    SearchResult,
    Pagination,
    useAPILoader,
    LilithRepo,
    CustomFetch,
    CustomFetchResponse,
    CloudFlareConfig,
    UseDomParser,
    UseDomParserImpl,
    Attributes,
    ElementProps,
} from "@atsu/lilith";
import { load, Cheerio, AnyNode } from "cheerio";

const handleLilithErrors = <T>(req: Promise<T>): Promise<T | null> =>
    req.catch((err) => {
        console.error(err);
        return null;
    });

export const useLilithLoader = (headers: CloudFlareConfig) => {
    const lilithLoader = useAPILoader({
        repo: LilithRepo.NHentai,
        configurations: {
            fetchImpl: customFetchImpl,
            domParser: useCheerioDomParser,
            headers,
        },
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

export const customFetchImpl: CustomFetch = async (
    url,
    options,
): Promise<CustomFetchResponse> => {
    const res = await fetch.default(url, options as any);
    return {
        text: () => res.text(), // We need this to avoid fetch/node-fetch "cannot find property 'disturbed' from undefined"
        json: <T>() => res.json() as T,
        status: res.status,
    };
};

export const useCheerioDomParser: UseDomParser = (stringDom: string) => {
    const $ = load(stringDom);

    const parser = (el: Cheerio<AnyNode>): UseDomParserImpl => {
        const find = (query: string) => parser(el.find(query).first());
        const findAll = (query: string) =>
            el
                .find(query)
                .map((_, element) => parser($(element)))
                .get();
        const getElement = (): ElementProps => {
            const attributes: Partial<Attributes> = {
                href: el.attr("href") || "",
                "data-src": el.attr("data-src") || "",
                width: parseInt(el.attr("width") || "0", 10),
                height: parseInt(el.attr("height") || "0", 10),
            };
            return {
                textContent: el.text(),
                attributes,
            };
        };

        return { find, findAll, getElement };
    };

    return parser($("html"));
};
