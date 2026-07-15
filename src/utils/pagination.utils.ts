import type { Request } from "express";

export interface PaginationData {
	page: number;
	limit: number;
	skip: number;
}

export interface PaginatedResult<T> {
	items: T[];
	page: number;
	limit: number;
	total: number;
	total_pages: number;
	has_next: boolean;
	has_prev: boolean;
}

export const get_pagination = (req: Request): PaginationData => {
	const page_raw = Number(req.query.page);
	const limit_raw = Number(req.query.limit);

	const page = Number.isFinite(page_raw) && page_raw > 0 ? page_raw : 1;
	const limit =
		Number.isFinite(limit_raw) && limit_raw > 0
			? Math.min(limit_raw, 100)
			: 10;

	return {
		page,
		limit,
		skip: (page - 1) * limit,
	};
};

export const build_paginated_result = <T>(
	items: T[],
	total: number,
	page: number,
	limit: number
): PaginatedResult<T> => {
	const total_pages = Math.max(1, Math.ceil(total / limit));

	return {
		items,
		page,
		limit,
		total,
		total_pages,
		has_next: page < total_pages,
		has_prev: page > 1,
	};
};
