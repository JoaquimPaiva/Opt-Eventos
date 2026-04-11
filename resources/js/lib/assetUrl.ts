const resolveBasePath = (): string => {
    if (typeof window === "undefined") {
        return "";
    }

    const currentPath = window.location.pathname;
    if (currentPath === "/public" || currentPath.startsWith("/public/")) {
        return "/public";
    }

    return "";
};

export const assetUrl = (path: string): string => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${resolveBasePath()}${normalizedPath}`;
};
