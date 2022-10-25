import { IFilter } from "../interfaces";

// Metrc expects a one-based page, but this method takes a zero-based page
export function collectionBodyFactory(
  page: number = 0,
  pageSize: number = 500,
  apiFilter: IFilter | null = null
): string {
  const requestBody = {
    request: {
      take: pageSize,
      skip: page * pageSize,
      page: page + 1,
      pageSize: pageSize,
      group: [],
    },
  };

  if (apiFilter != null) {
    requestBody["request"]["filter"] = apiFilter;
  }

  return JSON.stringify(requestBody);
}

export function packageLabelMatchFilterFactory(label: string): IFilter {
  // This filter can be used for partial and exact matches
  return {
    logic: "and",
    filters: [
      {
        field: "Label",
        operator: "endswith",
        value: label,
      },
    ],
  };
}
