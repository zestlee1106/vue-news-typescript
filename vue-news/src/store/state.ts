import { NewsItem } from "@/api";

const state = {
  news: [] as NewsItem[],
};

// MEMO: node_modules/vuex/types/vue.d.ts 에 연결했었음

type RootState = typeof state;

export { state, RootState };
