export type License = {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
};

export type Owner = {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  type: string;
  [key: string]: any;
};

export type Repository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: Owner;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  forks_count: number;
  topics: string[];
  license: License;
  visibility: string;
  [key: string]: any;
};

export type SearchCriteria = {
  stars: string;
  language?: string;
  created?: string;
};

export type FeedType = 'random' | 'new';
