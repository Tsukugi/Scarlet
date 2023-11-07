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

export const cookies: CloudFlareConfig = {
    "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/118.0",
    cookie: "cf_clearance=No07bTPjTPG8ay4yw6Swd2YWsl3OOQEyUD5k3CrfLV0-1698867081-0-1-6fa998a8.7d6487d8.38a8c748-160.0.0; csrftoken=GVZOyHvhqPkKd294OAxMu2szdWS9pbU4Pp6uHPOQ2EbDjzTlePBtaF3aF8kNVnNV",
};

export const useLilithLoader = () => {
    const lilithLoader = useAPILoader({
        repo: LilithRepo.NHentai,
        configurations: {
            fetchImpl: customFetchImpl,
            domParser: useCheerioDomParser,
            headers: cookies,
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
