"use client";

import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {bookApi} from "@/lib/api";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Card} from "@/components/ui/card";
import {LoadingGrid} from "@/components/shared/loading-grid";
import {PageHeader} from "@/components/shared/page-header";
import {PaginationControls} from "@/components/shared/pagination-controls";
import {useDebounce} from "@/hooks/use-debounce";
import {DEFAULT_PAGE_SIZE} from "@/lib/constants";
import Image from "next/image";
import {HiOutlineBookOpen, HiOutlineMagnifyingGlass} from "react-icons/hi2";

const CATEGORIES = ["All Books", "AI / ML", "Deep Learning", "System Design", "Cloud Infrastructure", "Languages"];

const REFERENCE_LINKS = [
    {
        name: "Free Programming Books (GitHub)",
        url: "https://github.com/EbookFoundation/free-programming-books",
        desc: "Curated list of free programming books"
    },
    {name: "Open Library", url: "https://openlibrary.org", desc: "Open, editable library catalog"},
    {
        name: "O'Reilly Open Books",
        url: "https://www.oreilly.com/openbook/",
        desc: "Classic O'Reilly titles free to read"
    },
    {name: "Project Gutenberg", url: "https://www.gutenberg.org", desc: "Over 70,000 free ebooks"},
    {name: "arXiv", url: "https://arxiv.org", desc: "Preprints in physics, math, CS, and more"},
];

export default function LibraryPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("All Books");
    const debouncedSearch = useDebounce(search, 400);

    const {data, isLoading} = useQuery({
        queryKey: ["books", page, debouncedSearch],
        queryFn: () =>
            debouncedSearch
                ? bookApi.search(debouncedSearch, page, DEFAULT_PAGE_SIZE).then((r) => r.data)
                : bookApi.list(page, DEFAULT_PAGE_SIZE).then((r) => r.data),
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <PageHeader
                title="Curated Technical Library"
                description="Discover definitive guides and reference materials for modern engineering."
            />

            <div className="relative mb-6 max-w-xl">
                <HiOutlineMagnifyingGlass
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    placeholder="Search titles, authors, ISBNs or topics..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                    className="pl-10"
                />
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <Badge
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="cursor-pointer px-4 py-1.5"
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </Badge>
                ))}
            </div>

            {isLoading ? (
                <LoadingGrid count={6} itemHeight="h-80"/>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data?.content.map((book) => (
                        <Card key={book.id} className="group overflow-hidden">
                            <div className="relative aspect-[3/4] bg-muted">
                                {book.coverUrl ? (
                                    <Image
                                        src={book.coverUrl}
                                        alt={book.title}
                                        fill
                                        loading="lazy"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <HiOutlineBookOpen className="h-12 w-12 text-muted-foreground/50"/>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    {book.category && (
                                        <Badge variant="secondary" className="text-xs">
                                            {book.category}
                                        </Badge>
                                    )}
                                    {book.rating > 0 && (
                                        <span className="text-sm font-medium text-yellow-500">
                      ★ {book.rating.toFixed(1)}
                    </span>
                                    )}
                                </div>
                                <h3 className="line-clamp-2 font-semibold">{book.title}</h3>
                                <p className="text-sm text-muted-foreground">{book.author}</p>
                                {book.description && (
                                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                        {book.description}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Referenced in {book.referencedCount} article{book.referencedCount !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {data && (
                <PaginationControls
                    page={page}
                    totalPages={data.totalPages}
                    isLast={data.last}
                    onPrevious={() => setPage((p) => p - 1)}
                    onNext={() => setPage((p) => p + 1)}
                />
            )}

            <section className="mt-12 rounded-xl border border-border/50 bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <HiOutlineBookOpen className="h-5 w-5 text-primary"/>
                    Reference &amp; open source libraries
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    Free and open book catalogs and references for learning and citation.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    {REFERENCE_LINKS.map((link) => (
                        <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
                        >
                            <span className="font-medium">{link.name}</span>
                            <span className="text-xs text-muted-foreground">{link.desc}</span>
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
