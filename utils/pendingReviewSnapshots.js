function normalizePendingBlockContent({ content, content2 } = {}) {
    if (content == null) {
        return null;
    }

    if (typeof content === "object") {
        return content;
    }

    const nextContent = {
        type: "richText",
        content,
    };

    if (content2 !== undefined) {
        nextContent.content2 = content2;
    }

    return nextContent;
}

function serializeFilesForReview(files = []) {
    return files.map((file) => ({
        id: file.id,
        title: file.title,
        filename: file.filename,
        url: file.url,
        status: file.status,
        createdAt: file.createdAt,
    }));
}

export { normalizePendingBlockContent, serializeFilesForReview };
